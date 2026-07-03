"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { FileText, ArrowRight } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { BadgeStatus } from "@/components/shared/BadgeStatus";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRealtimeLaporan } from '@/hooks/useRealtimeLaporan';
import { useRealtimePetugas } from "@/hooks/useRealtimePetugas";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoaders";
export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7 Days");
  
  // Menggunakan hook realtime yang ditarik dari Supabase
  const { laporanList, loading: loadingLaporan } = useRealtimeLaporan();
  const { petugasList, loading: loadingPetugas } = useRealtimePetugas();

  if (loadingLaporan || loadingPetugas) {
    return <DashboardSkeleton />;
  }

  // Filter laporan berdasarkan timeRange
  const now = new Date();
  const filteredLaporan = laporanList.filter((l) => {
    const reportDate = new Date(l.created_at);
    if (timeRange === "Today") {
      return reportDate.toDateString() === now.toDateString();
    } else if (timeRange === "7 Days") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return reportDate >= oneWeekAgo;
    } else if (timeRange === "30 Days") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return reportDate >= thirtyDaysAgo;
    } else if (timeRange === "This Year") {
      return reportDate.getFullYear() === now.getFullYear();
    }
    // "All Time" akan lolos filter (mereturn true)
    return true;
  });

  // Stats calculation (dari data live Supabase + Filter Waktu)
  const totalLaporan = filteredLaporan.length;
  const menungguCount = filteredLaporan.filter((l) => l.status === "menunggu").length;
  const prosesCount = filteredLaporan.filter((l) => l.status === "proses").length;
  const selesaiCount = filteredLaporan.filter((l) => l.status === "selesai").length;

  // Laporan Terbaru (Top 5)
  const recentReports = [...laporanList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const laporanCols = [
    { header: "Waktu", cell: (item: any) => new Date(item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
    { header: "Pelapor", accessorKey: "pelapor_nama" as any },
    { header: "Jenis", cell: (item: any) => <span className="capitalize">{item.jenis_kejadian}</span> },
    { header: "Lokasi", accessorKey: "lokasi" as any },
    { header: "Status", cell: (item: any) => <BadgeStatus status={item.status} className="rounded-full shadow-none" /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <PageHeader title="Hello, Admin!" />
      </div>

      <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
          <span className="relative flex h-3 w-3 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Sistem pemantauan beroperasi penuh. Seluruh data diperbarui secara real-time.
        </div>
        <Link href="/penugasan" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto rounded-full bg-white border-blue-200 shadow-sm text-xs font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer">
            Pantau Lapangan <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* --- BARIS 1 --- */}
        {/* KIRI: OVERVIEW STATS */}
        <div className="xl:col-span-3 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Overview performance</h2>
            <div className="flex bg-gray-50/80 p-1 rounded-full border border-gray-100/50 w-full sm:w-auto overflow-x-auto">
              {["Today", "7 Days", "30 Days", "This Year", "All Time"].map((range) => (
                <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${timeRange === range ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Laporan" value={totalLaporan} description="Laporan masuk" />
            <StatCard title="Menunggu" value={menungguCount} description="Perlu verifikasi" />
            <StatCard title="Sedang Proses" value={prosesCount} description="Ditangani petugas" />
            <StatCard title="Selesai" value={selesaiCount} description="Laporan selesai" />
          </div>
        </div>

        {/* KANAN: STATUS KESIAPAN */}
        <div className="xl:col-span-1">
          <div className="flex items-center justify-between mb-4 h-[38px]">
            <h3 className="text-lg font-bold text-gray-900">Kesiapan Petugas</h3>
            <Link href="/petugas" className="text-xs font-semibold hover:underline cursor-pointer">
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 font-medium">Tersedia</span>
              <span className="font-bold text-lg">{petugasList.filter((p) => p.status_petugas === "Tersedia").length}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 font-medium">Bertugas</span>
              <span className="font-bold text-lg">{petugasList.filter((p) => p.status_petugas === "Bertugas").length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Total Petugas</span>
              <span className="font-bold text-lg">{petugasList.length}</span>
            </div>
          </div>
        </div>

        {/* --- BARIS 2 --- */}
        {/* KIRI: LAPORAN TERBARU */}
        <div className="xl:col-span-3">
          <div className="flex items-center justify-between mb-4 h-[38px]">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Laporan Terbaru (Live)
            </h3>
            <Link href="/laporan">
              <Button variant="ghost" size="sm" className="text-black font-semibold hover:bg-gray-100 rounded-full cursor-pointer">
                Lihat Semua &rarr;
              </Button>
            </Link>
          </div>
          
          {recentReports.length > 0 ? (
            <DataTable columns={laporanCols} data={recentReports} />
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500">
              <FileText className="w-8 h-8 mb-2 text-gray-400" />
              <p>Belum ada laporan di database Supabase Anda.</p>
            </div>
          )}
        </div>

        {/* KANAN: AKTIVITAS PETUGAS */}
        <div className="xl:col-span-1">
          <div className="flex items-center justify-between mb-4 h-[38px]">
            <h3 className="text-lg font-bold text-gray-900">Aktivitas Petugas</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-5">
            {petugasList.slice(0, 4).map((petugas) => (
              <div key={petugas.id} className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 shrink-0">{petugas.nama[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{petugas.nama}</p>
                  <p className="text-[11px] text-gray-500 font-medium truncate">{petugas.status_petugas === "Tersedia" ? "Siaga di posko" : "Sedang menangani laporan"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
