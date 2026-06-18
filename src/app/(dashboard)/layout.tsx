'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Baca status dari localStorage saat pertama kali dimuat
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Mencegah flash (sidebar terbuka sesaat) sebelum localStorage terbaca
  }

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
      <div className="flex flex-col flex-1 min-w-0 bg-white transition-all duration-300 ease-in-out">
        <Navbar />
        <main className="flex-1 px-4 sm:px-8 lg:px-12 py-8">
          <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-12rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
