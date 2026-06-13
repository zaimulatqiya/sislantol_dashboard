'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Tipe data Admin yang disesuaikan dengan data dari Supabase (auth.users + profiles)
export interface AdminUser {
  id: string;
  email: string;
  nama: string;
  role: string;
  noHp?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<AdminUser>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Dapatkan session saat ini dari Supabase
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Dengarkan perubahan status otentikasi (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (authUser: any) => {
    try {
      // Ambil data tambahan (nama, role) dari tabel profiles
      // Juga coba ambil no_hp dan profile_image jika ada
      const { data, error } = await supabase
        .from('profiles')
        .select('nama, role, no_hp, profile_image')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      // Pastikan hanya admin yang bisa mengakses dashboard
      if (data.role !== 'admin') {
        await supabase.auth.signOut();
        setUser(null);
        alert("Akses Ditolak: Akun Anda bukan Admin.");
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          nama: data.nama,
          role: data.role,
          noHp: data.no_hp || '',
          profileImage: data.profile_image || undefined,
        });
      }
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error || !data.user) {
        return false;
      }
      return true; // onAuthStateChange akan menangani fetchProfile
    } catch (e) {
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const updateUser = async (updates: Partial<AdminUser>) => {
    if (!user) return false;

    try {
      // Update data di Supabase (tabel profiles)
      const dbUpdates: any = {};
      if (updates.nama !== undefined) dbUpdates.nama = updates.nama;
      if (updates.noHp !== undefined) dbUpdates.no_hp = updates.noHp;
      if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', user.id);
          
        if (error) throw error;
      }

      // Update state lokal (user context)
      setUser((prevUser) => prevUser ? { ...prevUser, ...updates } : prevUser);
      return true;
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
