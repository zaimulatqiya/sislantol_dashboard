'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BadgeStatus } from '@/components/shared/BadgeStatus';
import { Button } from '@/components/ui/button';
import { Eye, Search, FileText, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LaporanDetailSheet } from '../laporan/LaporanDetailSheet';
import { useRealtimePenugasan } from '@/hooks/useRealtimePenugasan';
import { getDisplayJenisKejadian } from '@/lib/utils';
import { TablePageSkeleton } from "@/components/shared/SkeletonLoaders";
import { TableToolbar } from "@/components/shared/TableToolbar";
export default function PenugasanPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [jenisFilter, setJenisFilter] = useState('semua');
  const itemsPerPage = 5;
  
  const [selectedLaporanId, setSelectedLaporanId] = useState<number | null>(null);

  const { penugasanList, loading, refetch } = useRealtimePenugasan();

  if (loading) {
    return <TablePageSkeleton />;
  }

  // Filter Data
  const filteredData = penugasanList.filter((item) => {
    const matchSearch = (item.petugas?.nama?.toLowerCase() || '').includes(search.toLowerCase()) || 
                        (item.laporan?.lokasi?.toLowerCase() || '').includes(search.toLowerCase());
                        
    const statusLaporan = item.laporan?.status || 'menunggu';
    const matchStatus = statusFilter === 'semua' || statusLaporan === statusFilter;
    
    const jenisKejadian = item.laporan?.jenis_kejadian || '';
    const matchJenis = jenisFilter === 'semua' || jenisKejadian === jenisFilter;

    const isNotFinished = statusLaporan !== 'selesai' && statusLaporan !== 'ditolak';

    return matchSearch && matchStatus && matchJenis && isNotFinished;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const columns = [
    { header: 'ID Laporan', accessorKey: 'laporan_id' as any },
    { header: 'Jenis Kejadian', cell: (item: any) => <span className="capitalize">{getDisplayJenisKejadian(item.laporan?.jenis_kejadian, item.laporan?.deskripsi) || '-'}</span> },
    { header: 'Lokasi', cell: (item: any) => item.laporan?.lokasi || '-' },
    { header: 'Petugas', cell: (item: any) => item.petugas?.nama || '-' },
    { header: 'Armada', cell: (item: any) => item.armada?.nopol || '-' },
    { 
      header: 'Waktu Ditugaskan', 
      cell: (item: any) => new Date(item.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
    },
    { header: 'Status Laporan', cell: (item: any) => <BadgeStatus status={item.laporan?.status || 'menunggu'} /> },
    { 
      header: 'Aksi', 
      cell: (item: any) => (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
          onClick={() => setSelectedLaporanId(item.laporan_id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Penugasan Aktif" 
        description="Pantau petugas dan armada yang sedang bertugas di lapangan saat ini secara realtime."
      />

      <TableToolbar
        searchQuery={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onRefresh={refetch}
        searchPlaceholder="Cari nama petugas atau lokasi..."
      >
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val ?? 'semua'); setPage(1); }}>
          <SelectTrigger className="w-full lg:w-[180px] bg-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
            <SelectItem value="proses">Proses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={jenisFilter} onValueChange={(val) => { setJenisFilter(val ?? 'semua'); setPage(1); }}>
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
        <span>Menampilkan <span className="text-gray-900 font-bold">{filteredData.length}</span> penugasan aktif.</span>
      </div>

      {filteredData.length > 0 ? (
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
          <p className="text-lg font-medium text-gray-900">Tidak ada penugasan</p>
          <p className="text-sm">Belum ada armada yang ditugaskan saat ini.</p>
        </div>
      )}

      <LaporanDetailSheet 
        laporanId={selectedLaporanId}
        open={!!selectedLaporanId}
        onOpenChange={(open) => {
          if (!open) setSelectedLaporanId(null);
        }}
      />
    </div>
  );
}
