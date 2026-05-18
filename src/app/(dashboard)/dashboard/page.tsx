"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { FileText, Clock, Loader, CheckCircle, ArrowRight, TrendingUp } from "lucide-react";
import { mockLaporan, mockPetugas } from "@/data/mockData";
import { DataTable } from "@/components/shared/DataTable";
import { BadgeStatus } from "@/components/shared/BadgeStatus";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Petugas } from "@/types";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("Week");
  const [petugasData, setPetugasData] = useState<Petugas[]>(mockPetugas);

  useEffect(() => {
    const saved = localStorage.getItem("petugas_data");
    if (saved) {
      try {
        setPetugasData(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // Stats calculation
  const totalLaporan = mockLaporan.length;
  const menungguCount = mockLaporan.filter((l) => l.status === "menunggu").length;
  const prosesCount = mockLaporan.filter((l) => l.status === "proses").length;
  const selesaiCount = mockLaporan.filter((l) => l.status === "selesai").length;

  // Laporan Terbaru (Top 5)
  const recentReports = [...mockLaporan].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const laporanCols = [
    { header: "Waktu", cell: (item: any) => new Date(item.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
    { header: "Pelapor", accessorKey: "pelaporNama" as any },
    { header: "Jenis", cell: (item: any) => <span className="capitalize">{item.jenisKejadian}</span> },
    { header: "Lokasi", accessorKey: "lokasi" as any },
    { header: "Status", cell: (item: any) => <BadgeStatus status={item.status} className="rounded-full shadow-none" /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <PageHeader title="Hello, Admin!" />
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <TrendingUp className="w-5 h-5" /> Ada 3 laporan baru dalam 1 jam terakhir.
        </div>
        <Button variant="outline" className="rounded-full bg-white border-gray-200 shadow-sm text-xs font-semibold">
          Tugas Aktif &nearr;
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* KIRI: OVERVIEW & LAPORAN */}
        <div className="xl:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Overview performance</h2>
            <div className="flex bg-gray-50/80 p-1 rounded-full border border-gray-100/50">
              {["Day", "Week", "Month", "Year"].map((range) => (
                <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${timeRange === range ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Laporan" value={totalLaporan} description="Dari 34 (7 hari terakhir)" />
            <StatCard title="Menunggu" value={menungguCount} description="Perlu verifikasi segera" />
            <StatCard title="Sedang Proses" value={prosesCount} description="Ditangani petugas" />
            <StatCard title="Selesai" value={selesaiCount} description="Dari 20 (7 hari terakhir)" />
          </div>

          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Laporan Terbaru</h3>
              <Link href="/laporan">
                <Button variant="ghost" size="sm" className="text-black font-semibold hover:bg-gray-100 rounded-full">
                  Lihat Semua &rarr;
                </Button>
              </Link>
            </div>
            <DataTable columns={laporanCols} data={recentReports} />
          </div>
        </div>

        {/* KANAN: STATUS KESIAPAN */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Kesiapan Petugas</h3>
              <Link href="/petugas" className="text-xs font-semibold hover:underline">
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span className="text-gray-500 font-medium">Tersedia</span>
                <span className="font-bold text-lg">{petugasData.filter((p) => p.status === "Tersedia").length}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span className="text-gray-500 font-medium">Bertugas</span>
                <span className="font-bold text-lg">{petugasData.filter((p) => p.status === "Bertugas").length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Total Petugas</span>
                <span className="font-bold text-lg">{petugasData.length}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Aktivitas Petugas</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-5">
              {petugasData.slice(0, 4).map((petugas) => (
                <div key={petugas.id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 shrink-0">{petugas.nama[0]}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{petugas.nama}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{petugas.status === "Tersedia" ? "Siaga di posko" : "Sedang menangani laporan"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
