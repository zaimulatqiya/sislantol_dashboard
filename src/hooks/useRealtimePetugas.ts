'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PetugasDB {
  id: string;
  email: string;
  nama: string;
  no_hp: string;
  role: 'admin' | 'petugas' | 'pengguna';
  status_petugas: 'Tersedia' | 'Bertugas' | 'Tidak Aktif';
  is_active: boolean;
  created_at: string;
  armada_id?: number;
}

export function useRealtimePetugas() {
  const [petugasList, setPetugasList] = useState<PetugasDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitial = async () => {
    try {
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'petugas')
        .order('nama', { ascending: true });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Supabase fetch timeout")), 12000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error("Supabase Error (petugas):", error);
        return;
      }

      if (data) {
        setPetugasList(data);
      }
    } catch (err) {
      console.error("Fetch Exception (petugas):", err);
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

    const channelId = `petugas-realtime-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT' && newRecord.role === 'petugas') {
            setPetugasList((prev) => [newRecord as PetugasDB, ...prev]);
          } else if (eventType === 'UPDATE') {
            if (newRecord.role === 'petugas') {
              // Update data petugas yang masih aktif
              setPetugasList((prev) => prev.map((i) => i.id === newRecord.id ? newRecord as PetugasDB : i));
            } else {
              // Role berubah (misal: downgrade ke pengguna) → hapus dari list
              setPetugasList((prev) => prev.filter((i) => i.id !== newRecord.id));
            }
          } else if (eventType === 'DELETE') {
            setPetugasList((prev) => prev.filter((i) => i.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  return { petugasList, loading, refetch: fetchInitial };
}
