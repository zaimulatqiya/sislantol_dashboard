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
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 font-medium">Memuat data laporan realtime...</p>
      </div>
    );
  }

  // Filter Data (Hanya tampilkan yang belum ditugaskan/diproses/selesai jika tidak difilter spesifik)
  const filteredData = laporanList.filter(item => {
    // Secara default (jika filter 'semua'), sembunyikan laporan yang sudah masuk penugasan
    if (statusFilter === 'semua' && ["ditugaskan", "proses", "selesai"].includes(item.status)) {
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

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari nama pelapor..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val ?? "semua"); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-50 border-gray-200">
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
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-50 border-gray-200">
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
