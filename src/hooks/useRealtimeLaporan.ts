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
    setLoading(true);
    const { data, error } = await supabase
      .from('laporan')
      .select(`
        *,
        penugasan (
          *,
          petugas:profiles (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLaporanList(data);
    }
    setLoading(false);
  };

  useEffect(() => {
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
              fetchInitial(); // re-fetch to get relations
              return prev;
            }
            if (eventType === 'UPDATE') {
              fetchInitial(); // re-fetch to get relations
              return prev;
            }
            if (eventType === 'DELETE') {
              // Hapus laporsupan
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

  return { laporanList, loading, refetch: fetchInitial };
}