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
  LogOut,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const MENU_ITEMS = [
  { name: 'Beranda', path: '/dashboard', icon: LayoutDashboard },
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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutDialogOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
 
  const springTransition: any = { type: 'spring', stiffness: 300, damping: 30 };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full bg-[#f8f9fa] text-gray-900 border-r border-gray-200 relative",
      isMobile ? "w-72" : "w-full"
    )}>
      <div className={cn(
        "flex flex-col relative h-20 justify-center shrink-0 border-b border-gray-100/50",
        (isCollapsed && !isMobile) ? "px-4 items-center" : "px-6"
      )}>
        {/* Tombol Toggle Floating (Hanya Desktop) */}
        {!isMobile && (
          <motion.button
            onClick={onToggle}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 z-50 focus:outline-none text-gray-600 hover:text-black transition-colors cursor-pointer"
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={springTransition}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        )}

        <div className={cn(
          "flex items-center w-full",
          (isCollapsed && !isMobile) ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <img src="/assets/logo 1.svg" alt="Sislantol Icon" className="h-6 w-auto object-contain" />
            </div>
            <AnimatePresence initial={false}>
              {(!isCollapsed || isMobile) && (
                <motion.div 
                  initial={{ opacity: 0, width: 0, display: "none" }}
                  animate={{ opacity: 1, width: "auto", display: "flex" }}
                  exit={{ opacity: 0, width: 0, transitionEnd: { display: "none" } }}
                  transition={springTransition}
                  className="flex flex-col whitespace-nowrap overflow-hidden"
                >
                  <span className="text-[17px] font-bold tracking-tight text-black leading-tight min-w-max py-0.5">SISLANTOL OPS</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <nav className="space-y-1.5 px-3">
          <AnimatePresence initial={false}>
            {(!isCollapsed || isMobile) && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0, display: "none" }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12, display: "block" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, transitionEnd: { display: "none" } }}
                className="overflow-hidden mt-4"
              >
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
              </motion.div>
            )}
          </AnimatePresence>

          {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const collapsed = isCollapsed && !isMobile;
            return (
              <div key={item.path} className="relative group">
                <Link
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-[18px] text-[15px] font-semibold transition-colors duration-200",
                    isActive 
                      ? "bg-white text-black shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-black",
                    collapsed ? "justify-center h-12 w-12 mx-auto gap-0" : "px-3 py-3 gap-3"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 min-w-[20px] transition-colors", isActive ? "text-black" : "text-gray-400")} />
                  
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0, display: "none" }}
                        animate={{ opacity: 1, width: "auto", display: "inline-block" }}
                        exit={{ opacity: 0, width: 0, transitionEnd: { display: "none" } }}
                        transition={springTransition}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

              </div>
            );
          })}
        </nav>
      </div>

      <div className={cn(
        "mt-auto mb-6",
        (isCollapsed && !isMobile) ? "mx-2 p-2" : "m-4 p-4",
        "rounded-lg bg-white shadow-sm border border-gray-100 flex flex-col gap-3"
      )}>
         <Link href="/profil" className={cn(
           "flex items-center rounded-xl transition-colors duration-200",
           (isCollapsed && !isMobile) ? "justify-center gap-0 p-1" : "px-2 py-1 gap-3 hover:bg-gray-50"
         )}>
            <div className="w-10 h-10 min-w-[40px] rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 overflow-hidden shadow-sm">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.nama?.charAt(0) || 'A'
              )}
            </div>
            
            <AnimatePresence initial={false}>
              {(!isCollapsed || isMobile) && (
                <motion.div 
                  initial={{ opacity: 0, width: 0, display: "none" }}
                  animate={{ opacity: 1, width: "auto", display: "block" }}
                  exit={{ opacity: 0, width: 0, transitionEnd: { display: "none" } }}
                  transition={springTransition}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-bold text-gray-900 truncate pr-2">{user?.nama}</p>
                  <p className="text-[11px] text-gray-500 truncate pr-2">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
         </Link>
         
         <div className="relative group">
           <button
            onClick={() => setIsLogoutDialogOpen(true)}
            title={(isCollapsed && !isMobile) ? "Log out" : undefined}
            className={cn(
              "flex items-center w-full rounded-2xl text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer",
              (isCollapsed && !isMobile) ? "justify-center py-2.5 px-0 h-12" : "px-3 py-2.5 gap-3"
            )}
           >
             <LogOut className="w-4 h-4 min-w-[16px]" />
             <AnimatePresence initial={false}>
               {(!isCollapsed || isMobile) && (
                 <motion.span 
                  initial={{ opacity: 0, width: 0, display: "none" }}
                  animate={{ opacity: 1, width: "auto", display: "inline-block" }}
                  exit={{ opacity: 0, width: 0, transitionEnd: { display: "none" } }}
                  transition={springTransition}
                  className="whitespace-nowrap overflow-hidden"
                 >
                   Log out
                 </motion.span>
               )}
             </AnimatePresence>
           </button>

         </div>
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

      {/* Desktop Sidebar Container Animasi Width */}
      <motion.div 
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={springTransition}
        className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen z-30 shrink-0"
      >
        <SidebarContent />
      </motion.div>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari Dashboard Sislantol?"
        onConfirm={handleLogout}
        confirmText="Ya, Keluar"
        variant="destructive"
        isLoading={isLoggingOut}
      />
    </>
  );
}
