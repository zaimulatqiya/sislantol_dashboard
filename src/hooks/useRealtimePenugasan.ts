'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PenugasanWithRelations {
  id: string;
  laporan_id: number;
  petugas_id: string;
  armada_id: string;
  status: 'aktif' | 'selesai' | 'dibatalkan';
  created_at: string;
  laporan?: any;
  petugas?: any;
  armada?: any;
}

export function useRealtimePenugasan() {
  const [penugasanList, setPenugasanList] = useState<PenugasanWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitial = async () => {
    try {
      const queryPromise = supabase
        .from('penugasan')
        .select(`
          *,
          laporan (*),
          petugas:profiles (*),
          armada (*)
        `)
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Supabase fetch timeout")), 12000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error("Supabase Error (penugasan):", error);
        return;
      }
      if (data) {
        setPenugasanList(data);
      }
    } catch (err) {
      console.error("Fetch Exception (penugasan):", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchInitial();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. Subscribe realtime
    const channelId = `penugasan-realtime-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'penugasan' },
        async (payload) => {
          fetchInitial();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laporan' },
        async (payload) => {
          // Refetch jika ada update laporan agar relasi (deskripsi, foto) ikut terupdate
          fetchInitial();
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  return { penugasanList, loading, refetch: fetchInitial };
}
