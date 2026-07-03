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
    let isMounted = true;

    const fetchProfile = async (authUser: any) => {
      try {
        const queryPromise = supabase
          .from('profiles')
          .select('nama, role, no_hp, profile_image')
          .eq('id', authUser.id)
          .single();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Fetch profile timeout")), 10000)
        );

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) throw error;

        if (data.role !== 'admin') {
          await supabase.auth.signOut();
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          alert("Akses Ditolak: Akun Anda bukan Admin.");
        } else {
          if (isMounted) {
            setUser({
              id: authUser.id,
              email: authUser.email,
              nama: data.nama,
              role: data.role,
              noHp: data.no_hp || '',
              profileImage: data.profile_image || undefined,
            });
          }
        }
      } catch (error) {
        console.error("Gagal mengambil profil (kemungkinan timeout jaringan):", error);
        if (isMounted) {
          // Hanya null-kan user jika sebelumnya memang belum ada data (initial load).
          // Jika sebelumnya sudah login, biarkan saja (jangan paksa logout akibat jaringan ngadat).
          setUser((prevUser) => prevUser ? prevUser : null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Gunakan HANYA onAuthStateChange termasuk INITIAL_SESSION
    // untuk menghindari race condition double-fetchProfile dari getSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    if (!isLoading) {
      // Daftar halaman yang bebas diakses tanpa perlu login
      const publicPaths = ['/login', '/'];
      
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Login timeout")), 10000)
      );

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error || !data.user) {
        setIsLoading(false);
        return false;
      }
      return true; // onAuthStateChange akan menangani fetchProfile dan mengembalikan isLoading ke false
    } catch (e) {
      console.error("Login exception:", e);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Timeout 3 detik untuk mencegah stuck jika jaringan ngadat
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Logout timeout")), 3000)
      );
      await Promise.race([supabase.auth.signOut(), timeoutPromise]);
    } catch (error) {
      console.warn("Jaringan bermasalah saat logout, memaksa logout lokal:", error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const updateUser = async (updates: Partial<AdminUser>) => {
    if (!user) return false;

    try {
      // Update data di Supabase (tabel profiles)
      const dbUpdates: any = {};
      if ('nama' in updates) dbUpdates.nama = updates.nama;
      if ('noHp' in updates) dbUpdates.no_hp = updates.noHp === undefined ? null : updates.noHp;
      if ('profileImage' in updates) dbUpdates.profile_image = updates.profileImage === undefined ? null : updates.profileImage;

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
