'use client';

import { useAuth } from '@/hooks/useAuth';
import { Bell, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { mockLaporan } from '@/data/mockData';

export function Navbar() {
  const { user } = useAuth();
  
  const pendingCount = mockLaporan.filter(l => l.status === 'menunggu').length;

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-x-4 bg-white/90 backdrop-blur-md px-4 sm:gap-x-6 sm:px-8 lg:px-12 pt-4">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        <form className="relative flex flex-1 max-w-2xl items-center" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <div className="w-full flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 hover:bg-gray-100/80 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-black">
            <Search className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
            <Input
              id="search-field"
              className="block flex-1 border-0 bg-transparent py-1.5 pl-3 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm shadow-none font-medium h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search..."
              type="search"
              name="search"
            />
            <div className="hidden sm:flex shrink-0 items-center justify-center bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-400 border border-gray-200">
              ⌘ K
            </div>
          </div>
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-black hover:bg-gray-100 rounded-full w-10 h-10">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-black ring-2 ring-white" />
            )}
          </Button>

          <Button className="rounded-full bg-black text-white hover:bg-gray-800 px-6 font-semibold">
            Open Site
          </Button>
        </div>
      </div>
    </header>
  );
}
