# Konfigurasi Backend Supabase — Sislantol (Bagian 1)
## Schema DDL, Trigger & Row Level Security

> **Arsitektur**: Serverless — Client (Next.js + Flutter) → Supabase SDK → PostgreSQL  
> **3 Role**: `admin`, `petugas`, `pengguna`

---

## Persiapan Awal

1. Buka [supabase.com](https://supabase.com) → **New Project** → nama: `sislantol`
2. Set password database, pilih region **Singapore**
3. Setelah project ready, buka **SQL Editor** → **New query**
4. Copy-paste setiap blok SQL di bawah **satu per satu**, lalu klik **Run**

> [!CAUTION]
> Jalankan setiap blok SQL **berurutan dari atas ke bawah**. Ada dependensi antar tabel.

---

## 1. ENUM Types

> [!IMPORTANT]
> Jalankan blok ini **paling pertama** sebelum membuat tabel, karena tabel akan menggunakan tipe ENUM ini.

```sql
CREATE TYPE public.user_role        AS ENUM ('admin', 'petugas', 'pengguna');
CREATE TYPE public.status_petugas   AS ENUM ('Tersedia', 'Bertugas', 'Tidak Aktif');
CREATE TYPE public.jenis_armada     AS ENUM ('derek', 'patroli', 'towing', 'ambulan');
CREATE TYPE public.status_armada    AS ENUM ('Tersedia', 'Digunakan', 'Dalam Perbaikan');
CREATE TYPE public.jenis_kejadian   AS ENUM ('mogok', 'kecelakaan', 'hambatan', 'lainnya');
CREATE TYPE public.status_laporan   AS ENUM ('menunggu', 'diverifikasi', 'ditugaskan',
                                             'proses', 'selesai', 'ditolak');
CREATE TYPE public.status_penugasan AS ENUM ('aktif', 'selesai');
```

---

## 2. Tabel `profiles`

```sql
CREATE TABLE public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama           VARCHAR(100),
  email          VARCHAR(255),
  no_hp          VARCHAR(20),
  role           public.user_role NOT NULL DEFAULT 'pengguna',
  status_petugas public.status_petugas DEFAULT 'Tidak Aktif',
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);
```

---

## 3. Helper Function

```sql
-- Helper: ambil role user yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
```

---

## 4. Tabel `armada`

```sql
CREATE TABLE public.armada (
  id           BIGSERIAL PRIMARY KEY,
  nama_armada  VARCHAR(100) NOT NULL,
  jenis        public.jenis_armada NOT NULL,
  nopol        VARCHAR(20) UNIQUE NOT NULL,
  status       public.status_armada DEFAULT 'Tersedia',
  pos          VARCHAR(100),
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Tabel `laporan`

```sql
CREATE TABLE public.laporan (
  id             BIGSERIAL PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pelapor_nama   VARCHAR(100) NOT NULL,
  pelapor_no_hp  VARCHAR(20),
  jenis_kejadian public.jenis_kejadian NOT NULL,
  lokasi         VARCHAR(255) NOT NULL,
  deskripsi      TEXT,
  foto_urls      TEXT[],        -- array URL foto kejadian (multiple foto)
  status         public.status_laporan DEFAULT 'menunggu',
  alasan_tolak   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_laporan_status ON public.laporan(status);
CREATE INDEX idx_laporan_user   ON public.laporan(user_id);
```

---

## 6. Tabel `penugasan`

```sql
CREATE TABLE public.penugasan (
  id              BIGSERIAL PRIMARY KEY,
  laporan_id      BIGINT NOT NULL REFERENCES public.laporan(id) ON DELETE CASCADE,
  petugas_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  armada_id       BIGINT REFERENCES public.armada(id) ON DELETE SET NULL,
  catatan_admin   TEXT,
  status          public.status_penugasan DEFAULT 'aktif',
  foto_bukti_url  VARCHAR(500),
  catatan_penutup TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  selesai_at      TIMESTAMPTZ
);
CREATE INDEX idx_penugasan_petugas ON public.penugasan(petugas_id);
CREATE INDEX idx_penugasan_laporan ON public.penugasan(laporan_id);
CREATE INDEX idx_penugasan_status  ON public.penugasan(status);
```

---

## 7. Auto-Update `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_laporan_updated
  BEFORE UPDATE ON public.laporan
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## 8. Trigger: Auth → Profiles Auto-Sync

> [!IMPORTANT]
> Trigger ini **wajib** agar setiap user baru yang register otomatis punya baris di `profiles`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, no_hp, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'no_hp', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pengguna')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Alur kerja trigger:**
```
Register (email + password + metadata)
  → auth.users INSERT
    → TRIGGER on_auth_user_created
      → handle_new_user()
        → INSERT ke public.profiles (id, email, nama, no_hp, role)
```

**Contoh kirim metadata saat register (Next.js):**
```typescript
await supabase.auth.signUp({
  email: 'petugas@email.com',
  password: 'password123',
  options: {
    data: { nama: 'Budi Santoso', no_hp: '081234567890', role: 'petugas' }
  }
});
```

---

## 9. Aktifkan RLS

```sql
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penugasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.armada    ENABLE ROW LEVEL SECURITY;
```

---

## 10. RLS Policy — `profiles`

| Role | SELECT | UPDATE |
|------|--------|--------|
| Admin | ✅ Semua | ✅ Semua |
| Petugas | ✅ Semua | ✅ Hanya milik sendiri |
| Pengguna | ✅ Milik sendiri | ❌ |

```sql
CREATE POLICY "admin_full_profiles" ON public.profiles
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "petugas_select_profiles" ON public.profiles
  FOR SELECT USING (public.get_my_role() = 'petugas');

CREATE POLICY "petugas_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (public.get_my_role() = 'petugas' AND id = auth.uid())
  WITH CHECK (public.get_my_role() = 'petugas' AND id = auth.uid());

CREATE POLICY "pengguna_select_own_profile" ON public.profiles
  FOR SELECT USING (public.get_my_role() = 'pengguna' AND id = auth.uid());

-- Agar trigger bisa insert
CREATE POLICY "service_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);
```

---

## 11. RLS Policy — `laporan`

| Role | SELECT | INSERT | UPDATE |
|------|--------|--------|--------|
| Admin | ✅ Semua | ✅ | ✅ Semua |
| Petugas | ✅ Semua | ❌ | ✅ Yang ditugaskan |
| Pengguna | ✅ Milik sendiri | ✅ | ❌ |
| Anonim | ❌ | ✅ | ❌ |

```sql
CREATE POLICY "admin_full_laporan" ON public.laporan
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "petugas_select_laporan" ON public.laporan
  FOR SELECT USING (public.get_my_role() = 'petugas');

CREATE POLICY "petugas_update_assigned_laporan" ON public.laporan
  FOR UPDATE
  USING (
    public.get_my_role() = 'petugas'
    AND EXISTS (
      SELECT 1 FROM public.penugasan
      WHERE penugasan.laporan_id = laporan.id
        AND penugasan.petugas_id = auth.uid()
    )
  )
  WITH CHECK (
    public.get_my_role() = 'petugas'
    AND EXISTS (
      SELECT 1 FROM public.penugasan
      WHERE penugasan.laporan_id = laporan.id
        AND penugasan.petugas_id = auth.uid()
    )
  );

CREATE POLICY "pengguna_select_own_laporan" ON public.laporan
  FOR SELECT USING (public.get_my_role() = 'pengguna' AND user_id = auth.uid());

CREATE POLICY "authenticated_insert_laporan" ON public.laporan
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "anon_insert_laporan" ON public.laporan
  FOR INSERT TO anon WITH CHECK (true);
```

---

## 12. RLS Policy — `penugasan`

| Role | SELECT | INSERT | UPDATE |
|------|--------|--------|--------|
| Admin | ✅ Semua | ✅ | ✅ |
| Petugas | ✅ Milik sendiri | ❌ | ✅ Milik sendiri |

```sql
CREATE POLICY "admin_full_penugasan" ON public.penugasan
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "petugas_select_own_penugasan" ON public.penugasan
  FOR SELECT USING (public.get_my_role() = 'petugas' AND petugas_id = auth.uid());

CREATE POLICY "petugas_update_own_penugasan" ON public.penugasan
  FOR UPDATE
  USING (public.get_my_role() = 'petugas' AND petugas_id = auth.uid())
  WITH CHECK (public.get_my_role() = 'petugas' AND petugas_id = auth.uid());
```

---

## 13. RLS Policy — `armada`

| Role | SELECT | INSERT/UPDATE/DELETE |
|------|--------|---------------------|
| Admin | ✅ Semua | ✅ |
| Petugas/Pengguna | ✅ Read only | ❌ |

```sql
CREATE POLICY "admin_full_armada" ON public.armada
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "authenticated_select_armada" ON public.armada
  FOR SELECT TO authenticated USING (true);
```

---

> [!TIP]
> **Verifikasi RLS**: Buka **Table Editor** → pastikan ada ikon 🔒 di setiap tabel. Lanjut ke **Bagian 2** untuk setup Storage & snippet integrasi SDK.
