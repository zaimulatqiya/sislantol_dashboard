'use client';

import { useAuth } from '@/hooks/useAuth';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { mockLaporan } from '@/data/mockData';

export function Navbar() {
  const { user } = useAuth();
  
  const pendingCount = mockLaporan.filter(l => l.status === 'menunggu').length;

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-x-4 bg-white/90 backdrop-blur-md px-4 sm:gap-x-6 sm:px-8 lg:px-12 pt-4">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-end">
        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          <Button disabled variant="ghost" size="icon" className="relative text-gray-600 hover:text-black hover:bg-gray-100 rounded-full w-10 h-10">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-black ring-2 ring-white" />
            )}
          </Button>

          <Button 
            className="rounded-full bg-black text-white hover:bg-gray-800 px-6 font-semibold cursor-pointer"
            onClick={() => window.open('/', '_blank')}
          >
            Open Site
          </Button>
        </div>
      </div>
    </header>
  );
}
