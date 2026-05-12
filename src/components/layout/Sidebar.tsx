'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Zap, 
  History, 
  Users, 
  Truck, 
  UserCircle, 
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/useAuth';

const MENU_ITEMS = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Laporan', path: '/laporan', icon: ClipboardList },
  { name: 'Penugasan', path: '/penugasan', icon: Zap },
  { name: 'Petugas', path: '/petugas', icon: Users },
  { name: 'Armada', path: '/armada', icon: Truck },
  { name: 'Riwayat', path: '/riwayat', icon: History },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuth();

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
 
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full bg-[#f8f9fa] text-gray-900 border-r border-gray-200 transition-all duration-300 ease-in-out",
      (isCollapsed && !isMobile) ? "w-20" : "w-72"
    )}>
      <div className={cn(
        "transition-all duration-300 flex flex-col",
        (isCollapsed && !isMobile) ? "p-4 items-center gap-6" : "p-6 pb-4"
      )}>
        <div className={cn(
          "flex items-center w-full",
          (isCollapsed && !isMobile) ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 min-w-[40px] rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
              <Truck className="w-5 h-5 text-black" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex flex-col whitespace-nowrap opacity-100 transition-opacity duration-300">
                <span className="text-[17px] font-bold tracking-tight text-black leading-none">Jasa Marga Ops</span>
              </div>
            )}
          </div>
          
          {(!isCollapsed || isMobile) && (
            <button 
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors hidden lg:flex"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {(isCollapsed && !isMobile) && (
          <button 
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1.5 px-3">
          {(!isCollapsed || isMobile) && (
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-4">Menu</p>
          )}
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const collapsed = isCollapsed && !isMobile;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={collapsed ? item.name : ""}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-[18px] text-[15px] font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-white text-black shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-black",
                  collapsed && "justify-center px-0 h-12 w-12 mx-auto"
                )}
              >
                <item.icon className={cn("w-5 h-5 min-w-[20px]", isActive ? "text-black" : "text-gray-400")} />
                {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn(
        "mt-auto mb-6 transition-all duration-300",
        (isCollapsed && !isMobile) ? "mx-2 p-2" : "m-4 p-4",
        "rounded-lg bg-white shadow-sm border border-gray-100 flex flex-col gap-3"
      )}>
         <Link href="/profil" className={cn(
           "flex items-center gap-3 px-2 py-1 hover:bg-gray-50 rounded-xl transition-colors",
           (isCollapsed && !isMobile) && "justify-center"
         )}>
            <div className="w-10 h-10 min-w-[40px] rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 overflow-hidden shadow-sm">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.nama?.charAt(0) || 'A'
              )}
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.nama}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
         </Link>
         <button
          onClick={logout}
          title={(isCollapsed && !isMobile) ? "Log out" : ""}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 w-full rounded-2xl text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors",
            (isCollapsed && !isMobile) && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 min-w-[16px]" />
          {(!isCollapsed || isMobile) && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
  

  return (
    <>
      <div className="lg:hidden fixed top-0 w-full h-16 bg-[#f8f9fa] border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
            <Truck className="w-4 h-4 text-black" />
          </div>
          <span className="text-base font-bold tracking-tight text-black">Jasa Marga Ops</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMobile} className="text-gray-900 hover:bg-gray-200">
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleMobile} />
          <div className="relative flex w-72 max-w-xs flex-1 transform transition transition-transform duration-300">
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-30 transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:w-20" : "lg:w-72"
      )}>
        <SidebarContent />
      </div>
    </>
  );
}
