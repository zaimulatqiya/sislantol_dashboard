'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Tipe data laporan sesuai schema (ENUM-based)
// 💡 Tip: gunakan `npx supabase gen types typescript` untuk auto-generate dari ENUM
interface Laporan {
  id: number;
  user_id: string | null;
  pelapor_nama: string;
  pelapor_no_hp: string;
  nomor_polisi: string | null;
  jenis_kejadian: 'mogok' | 'kecelakaan' | 'hambatan' | 'lainnya';
  lokasi: string;
  deskripsi: string;
  foto_urls: string[] | null;  // array URL foto kejadian (multiple)
  status: 'menunggu' | 'diverifikasi' | 'ditugaskan' | 'proses' | 'selesai' | 'ditolak';
  created_at: string;
  updated_at: string;
}

export function useRealtimeLaporan() {
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitial = async () => {
    try {
      // Hapus setLoading(true) di sini agar tidak flash jadi skeleton setiap ada update
      const queryPromise = supabase
        .from('laporan')
        .select(`
          *,
          penugasan (
            *,
            petugas:profiles (*)
          )
        `)
        .order('created_at', { ascending: false });

      // Anti-stuck: paksa throw error jika request menggantung lebih dari 12 detik
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Supabase fetch timeout")), 12000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error("Supabase Error (laporan):", error);
        return;
      }

      if (data) {
        setLaporanList(data);
      }
    } catch (err) {
      console.error("Fetch Exception (laporan):", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();

    // Re-fetch saat tab kembali aktif dari minimize/background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchInitial();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. Subscribe realtime untuk perubahan
    const channelId = `laporan-realtime-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',       // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'laporan',
        },
        (payload) => {
          const { eventType, old: oldRecord } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            // Re-fetch agar relasi (penugasan, petugas) ikut ter-update
            fetchInitial();
          } else if (eventType === 'DELETE') {
            // Untuk DELETE, kita bisa update optimistis tanpa re-fetch
            setLaporanList((prev) =>
              prev.filter((item) => item.id !== (oldRecord as Laporan).id)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'penugasan',
        },
        (payload) => {
          // Jika ada perubahan di penugasan (misal status diupdate dari mobile)
          // Refetch laporan agar relasi penugasan terupdate di UI
          fetchInitial();
        }
      )
      .subscribe();

    // 3. Cleanup saat component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  return { laporanList, loading, refetch: fetchInitial };
}