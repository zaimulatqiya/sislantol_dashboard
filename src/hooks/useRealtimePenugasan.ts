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
      setLoading(true);
      const { data, error } = await supabase
        .from('penugasan')
        .select(`
          *,
          laporan (*),
          petugas:profiles (*),
          armada (*)
        `)
        .order('created_at', { ascending: false });

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { penugasanList, loading, refetch: fetchInitial };
}
