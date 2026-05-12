'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BadgeStatus } from '@/components/shared/BadgeStatus';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, Search } from 'lucide-react';
import { mockLaporan, mockPetugas } from '@/data/mockData';
import Link from 'next/link';

export default function RiwayatPage() {
  const [jenisFilter, setJenisFilter] = useState('semua');
  const [petugasFilter, setPetugasFilter] = useState('semua');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Only Selesai or Ditolak
  let filteredData = mockLaporan.filter(l => l.status === 'selesai' || l.status === 'ditolak');

  if (jenisFilter !== 'semua') {
    filteredData = filteredData.filter(l => l.jenisKejadian === jenisFilter);
  }
  if (petugasFilter !== 'semua') {
    filteredData = filteredData.filter(l => l.petugasId === petugasFilter);
  }

  // Sorting
  filteredData = filteredData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const columns = [
    { header: 'ID', accessorKey: 'id' as any },
    { 
      header: 'Selesai Pada', 
      cell: (item: any) => new Date(item.updatedAt).toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      }) 
    },
    { header: 'Pelapor', accessorKey: 'pelaporNama' as any },
    { header: 'Jenis', cell: (item: any) => <span className="capitalize">{item.jenisKejadian}</span> },
    { header: 'Petugas', cell: (item: any) => item.petugasId ? mockPetugas.find(p => p.id === item.petugasId)?.nama : '-' },
    { header: 'Status', cell: (item: any) => <BadgeStatus status={item.status} /> },
    { 
      header: 'Detail', 
      cell: (item: any) => (
        <Link href={`/laporan/${item.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Riwayat Laporan" 
        description="Arsip semua laporan yang telah selesai atau ditolak."
      />

      <div className="flex flex-col sm:flex-row gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <Select value={jenisFilter} onValueChange={(val) => { setJenisFilter(val); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white">
            <SelectValue placeholder="Filter Jenis..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Kejadian</SelectItem>
            <SelectItem value="mogok">Mogok</SelectItem>
            <SelectItem value="kecelakaan">Kecelakaan</SelectItem>
            <SelectItem value="hambatan">Hambatan</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>

        <Select value={petugasFilter} onValueChange={(val) => { setPetugasFilter(val); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[250px] bg-white">
            <SelectValue placeholder="Filter Petugas..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Petugas</SelectItem>
            {mockPetugas.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
            ))}
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
