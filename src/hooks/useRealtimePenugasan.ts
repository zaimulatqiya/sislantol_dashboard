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

  useEffect(() => {
    // 1. Fetch data awal
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('penugasan')
        .select(`
          *,
          laporan (*),
          petugas:profiles (*),
          armada (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPenugasanList(data);
      }
      setLoading(false);
    };

    fetchInitial();

    // 2. Subscribe realtime
    const channel = supabase
      .channel('penugasan-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'penugasan' },
        async (payload) => {
          // Ketika ada perubahan, fetch ulang agar relasi (JOIN) ikut ter-update
          // Ini cara termudah dan teraman untuk memastikan data relasi (petugas/armada/laporan) sinkron
          fetchInitial();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { penugasanList, loading };
}
