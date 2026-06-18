'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BadgeStatus } from '@/components/shared/BadgeStatus';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, Search, FileText, RefreshCw } from 'lucide-react';
import { useRealtimeLaporan } from '@/hooks/useRealtimeLaporan';
import { LaporanDetailSheet } from './LaporanDetailSheet';
import { getDisplayJenisKejadian } from '@/lib/utils';
import { TablePageSkeleton } from "@/components/shared/SkeletonLoaders";
import { TableToolbar } from "@/components/shared/TableToolbar";
export default function LaporanPage() {
  const [selectedLaporanId, setSelectedLaporanId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [jenisFilter, setJenisFilter] = useState('semua');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Menggunakan hook realtime dari Supabase
  const { laporanList, loading, refetch } = useRealtimeLaporan();

  if (loading) {
    return <TablePageSkeleton />;
  }

  // Filter Data (Hanya tampilkan yang belum ditugaskan/diproses/selesai jika tidak difilter spesifik)
  const filteredData = laporanList.filter(item => {
    // Secara default (jika filter 'semua'), sembunyikan laporan yang sudah masuk penugasan atau ditolak
    if (statusFilter === 'semua' && ["ditugaskan", "proses", "selesai", "ditolak"].includes(item.status)) {
      return false;
    }

    const matchSearch = item.pelapor_nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'semua' || item.status === statusFilter;
    const matchJenis = jenisFilter === 'semua' || item.jenis_kejadian === jenisFilter;
    return matchSearch && matchStatus && matchJenis;
  });

  // Urutkan dari yang terbaru
  const sortedData = [...filteredData].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const columns = [
    { header: 'ID', accessorKey: 'id' as any },
    { 
      header: 'Waktu', 
      cell: (item: any) => new Date(item.created_at).toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      }) 
    },
    { header: 'Pelapor', accessorKey: 'pelapor_nama' as any },
    { header: 'Jenis Kejadian', cell: (item: any) => <span className="capitalize">{getDisplayJenisKejadian(item.jenis_kejadian, item.deskripsi)}</span> },
    { header: 'Lokasi', accessorKey: 'lokasi' as any },
    { header: 'Status', cell: (item: any) => <BadgeStatus status={item.status} /> },
    { 
      header: 'Aksi', 
      cell: (item: any) => (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={() => setSelectedLaporanId(item.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Laporan Masuk (Live)" 
        description="Pantau secara realtime laporan kejadian dari pengguna jalan."
      />

      <TableToolbar
        searchQuery={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onRefresh={refetch}
        searchPlaceholder="Cari nama pelapor atau lokasi..."
      >
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val ?? "semua"); setPage(1); }}>
          <SelectTrigger className="w-full lg:w-[180px] bg-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Belum Ditugaskan</SelectItem>
            <SelectItem value="menunggu">Menunggu</SelectItem>
            <SelectItem value="diverifikasi">Diverifikasi</SelectItem>
            <SelectItem value="ditolak">Ditolak</SelectItem>
            <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
            <SelectItem value="proses">Proses</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>

        <Select value={jenisFilter} onValueChange={(val) => { setJenisFilter(val ?? "semua"); setPage(1); }}>
          <SelectTrigger className="w-full lg:w-[180px] bg-white">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Semua Jenis</SelectItem>
            <SelectItem value="mogok">Mogok</SelectItem>
            <SelectItem value="kecelakaan">Kecelakaan</SelectItem>
            <SelectItem value="hambatan">Hambatan</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </TableToolbar>

      <div className="flex justify-between items-center text-sm font-medium text-gray-500 pb-1 pt-2">
        <span>Menampilkan <span className="text-gray-900 font-bold">{sortedData.length}</span> laporan.</span>
      </div>

      {sortedData.length > 0 ? (
        <DataTable 
          columns={columns} 
          data={paginatedData} 
          pagination={{
            page,
            totalPages: totalPages === 0 ? 1 : totalPages,
            onPageChange: setPage
          }}
        />
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-500">
          <FileText className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-900">Tidak ada laporan</p>
          <p className="text-sm">Belum ada laporan yang cocok dengan kriteria pencarian Anda.</p>
        </div>
      )}

      {/* Sheet untuk Detail Laporan */}
      <LaporanDetailSheet 
        laporanId={selectedLaporanId}
        open={!!selectedLaporanId}
        onOpenChange={(open) => {
          if (!open) setSelectedLaporanId(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
