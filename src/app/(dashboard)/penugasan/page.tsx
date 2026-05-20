'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BadgeStatus } from '@/components/shared/BadgeStatus';
import { mockPenugasan, mockLaporan, mockPetugas, mockArmada } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { LaporanDetailSheet } from '../laporan/LaporanDetailSheet';

export default function PenugasanPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [jenisFilter, setJenisFilter] = useState('semua');
  const itemsPerPage = 5;
  
  const [penugasanData, setPenugasanData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedLaporanId, setSelectedLaporanId] = useState<string | null>(null);

  const loadData = () => {
    const savedPenugasan = localStorage.getItem("penugasan_data");
    let allPenugasan = savedPenugasan ? JSON.parse(savedPenugasan) : [...mockPenugasan];
    
    const savedLaporan = localStorage.getItem("laporan_data");
    let allLaporan = savedLaporan ? JSON.parse(savedLaporan) : [...mockLaporan];
    
    const savedPetugas = localStorage.getItem("petugas_data");
    let allPetugas = savedPetugas ? JSON.parse(savedPetugas) : [...mockPetugas];
    
    const savedArmada = localStorage.getItem("armada_data");
    let allArmada = savedArmada ? JSON.parse(savedArmada) : [...mockArmada];

    const enrichedList = allPenugasan
      .filter((p: any) => p.status === 'aktif')
      .map((p: any) => {
        const laporan = allLaporan.find((l: any) => l.id === p.laporanId);
        const petugas = allPetugas.find((pt: any) => pt.id === p.petugasId);
        const armada = allArmada.find((a: any) => a.id === p.armadaId);
        
        return { ...p, laporan, petugas, armada };
      });

    // Urutkan berdasarkan waktu paling baru
    enrichedList.sort((a: any, b: any) => new Date(b.waktuDitugaskan).getTime() - new Date(a.waktuDitugaskan).getTime());
    
    setPenugasanData(enrichedList);
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  if (!isMounted) return null;

  // Filter Data
  const filteredData = penugasanData.filter((item: any) => {
    const matchSearch = item.petugas?.nama?.toLowerCase().includes(search.toLowerCase()) || 
                        item.laporan?.lokasi?.toLowerCase().includes(search.toLowerCase());
                        
    const statusLaporan = item.laporan?.status || 'menunggu';
    const matchStatus = statusFilter === 'semua' || statusLaporan === statusFilter;
    
    const jenisKejadian = item.laporan?.jenisKejadian || '';
    const matchJenis = jenisFilter === 'semua' || jenisKejadian === jenisFilter;

    return matchSearch && matchStatus && matchJenis;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={() => setSelectedLaporanId(item.laporanId)}
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
        description="Pantau petugas dan armada yang sedang bertugas di lapangan saat ini."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari nama petugas atau lokasi..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>

        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val ?? 'semua'); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
            <SelectItem value="proses">Proses</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>

        <Select value={jenisFilter} onValueChange={(val) => { setJenisFilter(val ?? 'semua'); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
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

      <DataTable 
        columns={columns} 
        data={paginatedData} 
        pagination={{
          page,
          totalPages: totalPages === 0 ? 1 : totalPages,
          onPageChange: setPage
        }}
      />

      <LaporanDetailSheet 
        laporanId={selectedLaporanId}
        open={!!selectedLaporanId}
        onOpenChange={(open) => {
          if (!open) setSelectedLaporanId(null);
        }}
        onLaporanUpdated={loadData}
      />
    </div>
  );
}
