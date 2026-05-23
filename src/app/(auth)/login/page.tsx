'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Zap, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CAROUSEL_IMAGES = [
  '/assets/dashboard-preview.png',
  '/assets/preview-2.png'
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@sislantol.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(email, password);
    if (!success) {
      setError('Email atau password salah. Silakan coba lagi.');
      setIsSubmitting(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-start justify-center mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Selamat Datang di Sislantol</h2>
            <p className="text-base text-gray-500">Masuk untuk memantau lalu lintas dan mengelola layanan patroli tol.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Alamat Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sislantol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-300 focus-visible:ring-blue-600 h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 font-medium">Kata Sandi</Label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lupa sandi?</a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-gray-300 focus-visible:ring-blue-600 h-11"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Login'}
            </Button>
          </form>



          <p className="text-center text-sm text-gray-600 mt-8">
            Demo account: <span className="font-semibold text-gray-800">admin@sislantol.com</span> / <span className="font-semibold text-gray-800">password</span>
          </p>
        </div>
      </div>

      {/* Right side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3b5998] p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="max-w-2xl w-full z-10 text-white mb-10 pl-4">
          <h2 className="text-4xl font-semibold mb-4 leading-tight">Pantau Lalu Lintas Tol<br />dengan Percaya Diri</h2>
          <p className="text-blue-100 text-lg opacity-90 max-w-xl">
            Dari pemantauan armada hingga penanganan insiden darurat — Sislantol menyederhanakan setiap detail operasional Anda.
          </p>
        </div>

        <div className="relative w-full max-w-2xl aspect-video rounded-xl shadow-2xl overflow-hidden z-10 bg-blue-800/50 mx-auto border border-white/10">
          {CAROUSEL_IMAGES.map((src, idx) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentImageIdx ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={src}
                alt="Dashboard preview"
                className="w-full h-full object-cover object-top"
              />
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2 mt-8 z-10 pl-4">
          {CAROUSEL_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIdx(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === currentImageIdx ? 'w-8 bg-white' : 'w-4 bg-white/40'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Quote */}
        <div className="max-w-xl w-full z-10 text-white mt-12 text-sm pl-4">
          <p className="opacity-90">
            "Sislantol mempercepat respon petugas derek dan medis. Sangat membantu!"
          </p>
          <p className="mt-2 font-medium opacity-100">
            — Budi Santoso, Kepala Shift Operasional
          </p>
        </div>
      </div>
    </div>
  );
}
