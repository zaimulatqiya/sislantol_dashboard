'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BadgeStatus } from '@/components/shared/BadgeStatus';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, Search } from 'lucide-react';
import { mockLaporan } from '@/data/mockData';
import Link from 'next/link';

export default function LaporanPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [jenisFilter, setJenisFilter] = useState('semua');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Filter Data
  const filteredData = mockLaporan.filter(item => {
    const matchSearch = item.pelaporNama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'semua' || item.status === statusFilter;
    const matchJenis = jenisFilter === 'semua' || item.jenisKejadian === jenisFilter;
    return matchSearch && matchStatus && matchJenis;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const columns = [
    { header: 'ID', accessorKey: 'id' as any },
    { 
      header: 'Waktu', 
      cell: (item: any) => new Date(item.createdAt).toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      }) 
    },
    { header: 'Pelapor', accessorKey: 'pelaporNama' as any },
    { header: 'Jenis Kejadian', cell: (item: any) => <span className="capitalize">{item.jenisKejadian}</span> },
    { header: 'Lokasi', accessorKey: 'lokasi' as any },
    { header: 'Status', cell: (item: any) => <BadgeStatus status={item.status} /> },
    { 
      header: 'Aksi', 
      cell: (item: any) => (
        <Link href={`/laporan/${item.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Laporan Masuk" 
        description="Kelola dan pantau semua laporan kejadian dari pengguna tol."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari nama pelapor..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="menunggu">Menunggu</SelectItem>
            <SelectItem value="diverifikasi">Diverifikasi</SelectItem>
            <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
            <SelectItem value="proses">Proses</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
            <SelectItem value="ditolak">Ditolak</SelectItem>
          </SelectContent>
        </Select>

        <Select value={jenisFilter} onValueChange={(val) => { setJenisFilter(val); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Jenis</SelectItem>
            <SelectItem value="mogok">Mogok</SelectItem>
            <SelectItem value="kecelakaan">Kecelakaan</SelectItem>
            <SelectItem value="hambatan">Hambatan</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable 
        columns={columns} 
        data={paginatedData} 
        pagination={{
          page,
          totalPages: totalPages === 0 ? 1 : totalPages,
          onPageChange: setPage
        }}
      />
    </div>
  );
}
