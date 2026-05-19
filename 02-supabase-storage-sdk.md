# Konfigurasi Backend Supabase — Sislantol (Bagian 2)
## Storage Bucket & Integrasi SDK

---

## 1. Setup Storage Bucket

Buka **Supabase Dashboard** → **Storage** → **New Bucket**

### Bucket 1: `bukti-kejadian`
- **Nama**: `bukti-kejadian`
- **Public**: ✅ Ya (centang "Make public")
- **Fungsi**: Menyimpan foto laporan kejadian dari pengguna jalan

### Bucket 2: `bukti-penyelesaian`
- **Nama**: `bukti-penyelesaian`
- **Public**: ✅ Ya (centang "Make public")
- **Fungsi**: Menyimpan foto bukti penanganan selesai dari petugas

> [!NOTE]
> Bucket **public** berarti file bisa diakses via URL tanpa auth token. Cocok untuk foto yang perlu ditampilkan di dashboard. Upload tetap dikontrol oleh RLS policy di bawah.

---

## 2. Storage RLS Policies

Jalankan SQL ini di **SQL Editor**:

### Bucket `bukti-kejadian`

```sql
-- Siapa saja (authenticated + anon) bisa upload foto laporan
CREATE POLICY "allow_upload_bukti_kejadian"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'bukti-kejadian');

-- Semua orang bisa melihat foto
CREATE POLICY "allow_read_bukti_kejadian"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bukti-kejadian');

-- Admin bisa hapus
CREATE POLICY "admin_delete_bukti_kejadian"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'bukti-kejadian'
    AND public.get_my_role() = 'admin'
  );
```

### Bucket `bukti-penyelesaian`

```sql
-- Petugas & Admin bisa upload foto penyelesaian
CREATE POLICY "allow_upload_bukti_penyelesaian"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bukti-penyelesaian'
    AND public.get_my_role() IN ('petugas', 'admin')
  );

-- Semua user authenticated bisa melihat foto
CREATE POLICY "allow_read_bukti_penyelesaian"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bukti-penyelesaian');

-- Admin bisa hapus
CREATE POLICY "admin_delete_bukti_penyelesaian"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'bukti-penyelesaian'
    AND public.get_my_role() = 'admin'
  );
```

### Struktur Folder yang Direkomendasikan

```
bukti-kejadian/
  └── laporan-{laporan_id}/
      └── foto-{timestamp}.jpg

bukti-penyelesaian/
  └── penugasan-{penugasan_id}/
      └── bukti-{timestamp}.jpg
```

---

## 3. Setup Supabase Client di Next.js

### Install SDK

```bash
npm install @supabase/supabase-js
```

### Buat file `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Buat file `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

> [!WARNING]
> Dapatkan nilai URL dan Anon Key dari **Supabase Dashboard** → **Settings** → **API**. Jangan pernah share `service_role` key di client-side.

---

## 4. Next.js: Realtime Subscribe Tabel Laporan

Contoh hook untuk dashboard admin agar auto-update saat ada laporan baru:

### `src/hooks/useRealtimeLaporan.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Tipe data laporan sesuai schema
interface Laporan {
  id: number;
  user_id: string | null;
  pelapor_nama: string;
  pelapor_no_hp: string;
  jenis_kejadian: 'mogok' | 'kecelakaan' | 'hambatan' | 'lainnya';
  lokasi: string;
  deskripsi: string;
  foto_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useRealtimeLaporan() {
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch data awal
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('laporan')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLaporanList(data);
      }
      setLoading(false);
    };

    fetchInitial();

    // 2. Subscribe realtime untuk perubahan
    const channel = supabase
      .channel('laporan-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',       // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'laporan',
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setLaporanList((prev) => {
            if (eventType === 'INSERT') {
              // Tambah laporan baru di awal list
              return [newRecord as Laporan, ...prev];
            }
            if (eventType === 'UPDATE') {
              // Update laporan yang berubah
              return prev.map((item) =>
                item.id === (newRecord as Laporan).id
                  ? (newRecord as Laporan)
                  : item
              );
            }
            if (eventType === 'DELETE') {
              // Hapus laporan
              return prev.filter(
                (item) => item.id !== (oldRecord as Laporan).id
              );
            }
            return prev;
          });
        }
      )
      .subscribe();

    // 3. Cleanup saat component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { laporanList, loading };
}
```

### Penggunaan di Page Dashboard

```tsx
'use client';

import { useRealtimeLaporan } from '@/hooks/useRealtimeLaporan';

export default function DashboardPage() {
  const { laporanList, loading } = useRealtimeLaporan();

  if (loading) return <p>Memuat data...</p>;

  return (
    <div>
      <h1>Dashboard Laporan ({laporanList.length})</h1>
      {laporanList.map((laporan) => (
        <div key={laporan.id}>
          <h3>{laporan.pelapor_nama}</h3>
          <p>{laporan.jenis_kejadian} — {laporan.lokasi}</p>
          <span>{laporan.status}</span>
        </div>
      ))}
    </div>
  );
}
```

> [!IMPORTANT]
> **Aktifkan Realtime** untuk tabel `laporan`: Buka **Supabase Dashboard** → **Database** → **Replication** → centang tabel `laporan` pada **supabase_realtime** publication.

---

## 5. Flutter: Upload Foto & Update Penugasan

### Setup di `pubspec.yaml`

```yaml
dependencies:
  supabase_flutter: ^2.0.0
  image_picker: ^1.0.0
```

### Init Supabase di `main.dart`

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://xxxxx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx',
  );

  runApp(const MyApp());
}

// Helper global
final supabase = Supabase.instance.client;
```

### Fungsi: Upload Foto + Selesaikan Penugasan

```dart
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final supabase = Supabase.instance.client;

/// Pilih foto dari kamera/galeri, upload, lalu update penugasan jadi selesai
Future<void> selesaikanPenugasan({
  required int penugasanId,
  required int laporanId,
  required String catatanPenutup,
}) async {
  // 1. Pilih foto
  final picker = ImagePicker();
  final XFile? foto = await picker.pickImage(
    source: ImageSource.camera,  // atau ImageSource.gallery
    maxWidth: 1200,
    imageQuality: 80,
  );

  if (foto == null) return; // User batal

  // 2. Upload foto ke Storage
  final file = File(foto.path);
  final timestamp = DateTime.now().millisecondsSinceEpoch;
  final filePath = 'penugasan-$penugasanId/bukti-$timestamp.jpg';

  await supabase.storage
      .from('bukti-penyelesaian')
      .upload(filePath, file);

  // 3. Dapatkan public URL foto
  final fotoUrl = supabase.storage
      .from('bukti-penyelesaian')
      .getPublicUrl(filePath);

  // 4. Update penugasan → selesai
  await supabase.from('penugasan').update({
    'status': 'selesai',
    'foto_bukti_url': fotoUrl,
    'catatan_penutup': catatanPenutup,
    'selesai_at': DateTime.now().toIso8601String(),
  }).eq('id', penugasanId);

  // 5. Update status laporan → selesai
  await supabase.from('laporan').update({
    'status': 'selesai',
  }).eq('id', laporanId);

  // 6. Update status petugas → Tersedia
  final userId = supabase.auth.currentUser!.id;
  await supabase.from('profiles').update({
    'status_petugas': 'Tersedia',
  }).eq('id', userId);
}
```

### Contoh Penggunaan di Widget

```dart
ElevatedButton(
  onPressed: () async {
    try {
      await selesaikanPenugasan(
        penugasanId: 1,
        laporanId: 5,
        catatanPenutup: 'Kendaraan sudah dievakuasi ke KM 45.',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Penugasan berhasil diselesaikan!')),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  },
  child: const Text('Selesaikan & Upload Bukti'),
),
```

---

## 6. Checklist Akhir

Sebelum go-live, pastikan semua sudah ✅:

| # | Item | Cara Cek |
|---|------|----------|
| 1 | 4 tabel sudah dibuat | Table Editor → lihat profiles, laporan, penugasan, armada |
| 2 | RLS aktif di semua tabel | Ada ikon 🔒 di setiap tabel |
| 3 | Trigger auth → profiles | Register user baru → cek row muncul di profiles |
| 4 | 2 storage bucket dibuat | Storage → lihat bukti-kejadian, bukti-penyelesaian |
| 5 | Realtime aktif untuk laporan | Database → Replication → laporan tercentang |
| 6 | `.env.local` sudah diisi | Cek URL dan Anon Key sudah benar |
| 7 | Test RLS dengan role berbeda | Login sebagai admin/petugas/pengguna, coba akses data |

> [!TIP]
> **Test cepat RLS**: Di SQL Editor Supabase, gunakan query berikut untuk simulasi akses sebagai user tertentu:
> ```sql
> -- Set session sebagai user tertentu
> SET request.jwt.claims = '{"sub": "uuid-user-di-sini", "role": "authenticated"}';
> SELECT * FROM public.laporan; -- Harusnya hanya tampil sesuai policy
> ```

---

## Diagram Arsitektur

```
┌──────────────────┐     ┌──────────────────┐
│  Next.js Admin   │     │  Flutter App      │
│  Dashboard       │     │  (Petugas/User)   │
└────────┬─────────┘     └────────┬──────────┘
         │  Supabase SDK          │  Supabase SDK
         │  (JS/TS)               │  (Dart)
         ▼                        ▼
┌─────────────────────────────────────────────┐
│              SUPABASE CLOUD                  │
│                                              │
│  ┌──────────┐  ┌─────────┐  ┌────────────┐ │
│  │   Auth   │  │ Storage │  │  Realtime   │ │
│  │          │  │         │  │  (WebSocket)│ │
│  └────┬─────┘  └────┬────┘  └─────┬──────┘ │
│       │              │             │         │
│       ▼              ▼             ▼         │
│  ┌──────────────────────────────────────┐   │
│  │         PostgreSQL Database          │   │
│  │  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │ profiles │  │     laporan      │  │   │
│  │  ├──────────┤  ├──────────────────┤  │   │
│  │  │ armada   │  │   penugasan     │  │   │
│  │  └──────────┘  └──────────────────┘  │   │
│  │         🔒 RLS Policies Active       │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```
