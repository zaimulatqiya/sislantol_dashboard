"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { WifiOff } from "lucide-react";

export function GlobalOfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top-2 duration-300 shadow-sm">
      <WifiOff className="h-4 w-4" />
      <span>
        Anda sedang offline. Beberapa perubahan mungkin tidak tersimpan hingga koneksi pulih.
      </span>
    </div>
  );
}
