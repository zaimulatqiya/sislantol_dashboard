'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface ArmadaDB {
  id: number;
  nama_armada: string;
  jenis: 'derek' | 'patroli' | 'towing' | 'ambulan';
  nopol: string;
  pos: string;
  status: 'Tersedia' | 'Digunakan' | 'Dalam Perbaikan';
  created_at?: string;
}

export function useRealtimeArmada() {
  const [armadaList, setArmadaList] = useState<ArmadaDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('armada')
        .select('*')
        .order('nama_armada', { ascending: true });

      if (error) {
        console.error("Supabase Error (armada):", error);
        return;
      }
      if (data) {
        setArmadaList(data);
      }
    } catch (err) {
      console.error("Fetch Exception (armada):", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();

    const channelId = `armada-realtime-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'armada' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          setArmadaList((prev) => {
            if (eventType === 'INSERT') return [newRecord as ArmadaDB, ...prev];
            if (eventType === 'UPDATE') return prev.map((i) => i.id === (newRecord as ArmadaDB).id ? newRecord as ArmadaDB : i);
            if (eventType === 'DELETE') return prev.filter((i) => i.id !== (oldRecord as ArmadaDB).id);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { armadaList, loading, refetch: fetchInitial };
}
