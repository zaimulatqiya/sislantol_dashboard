'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BadgeStatus } from '@/components/shared/BadgeStatus';
import { mockPenugasan, mockLaporan, mockPetugas, mockArmada } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PenugasanPage() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  // Enrich data
  const penugasanList = mockPenugasan
    .filter(p => p.status === 'aktif')
    .map(p => {
      const laporan = mockLaporan.find(l => l.id === p.laporanId);
      const petugas = mockPetugas.find(pt => pt.id === p.petugasId);
      const armada = mockArmada.find(a => a.id === p.armadaId);
      
      return {
        ...p,
        laporan,
        petugas,
        armada
      };
    });

  const totalPages = Math.ceil(penugasanList.length / itemsPerPage);
  const paginatedData = penugasanList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const columns = [
    { header: 'ID Laporan', accessorKey: 'laporanId' as any },
    { header: 'Jenis Kejadian', cell: (item: any) => <span className="capitalize">{item.laporan?.jenisKejadian}</span> },
    { header: 'Lokasi', cell: (item: any) => item.laporan?.lokasi },
    { header: 'Petugas', cell: (item: any) => item.petugas?.nama },
    { header: 'Armada', cell: (item: any) => item.armada?.nopol },
    { 
      header: 'Waktu Ditugaskan', 
      cell: (item: any) => new Date(item.waktuDitugaskan).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
    },
    { header: 'Status Laporan', cell: (item: any) => <BadgeStatus status={item.laporan?.status || 'menunggu'} /> },
    { 
      header: 'Aksi', 
      cell: (item: any) => (
        <Link href={`/laporan/${item.laporanId}`}>
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
        title="Penugasan Aktif" 
        description="Pantau petugas dan armada yang sedang bertugas di lapangan saat ini."
      />

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
