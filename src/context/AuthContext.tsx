'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Admin } from '@/types';
import { mockAdmin } from '@/data/mockData';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: Admin | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (newData: Partial<Admin>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem('sislantol_admin');
    const isLoggedIn = localStorage.getItem('sislantol_logged_in') === 'true';
    
    if (stored && isLoggedIn) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

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
    // Mock login delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email === mockAdmin.email && pass === 'password') { // simple mock
      // Check if we already have a saved user with this email
      const stored = localStorage.getItem('sislantol_admin');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email === email) {
          setUser(parsed);
          localStorage.setItem('sislantol_logged_in', 'true');
          return true;
        }
      }
      
      // Default fallback to mockAdmin
      setUser(mockAdmin);
      localStorage.setItem('sislantol_admin', JSON.stringify(mockAdmin));
      localStorage.setItem('sislantol_logged_in', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.setItem('sislantol_logged_in', 'false');
    router.push('/login');
  };

  const updateUser = (newData: Partial<Admin>) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      localStorage.setItem('sislantol_admin', JSON.stringify(updatedUser));
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
