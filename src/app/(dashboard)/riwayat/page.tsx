'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BadgeStatus } from '@/components/shared/BadgeStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, Search, Trash2, RefreshCw } from 'lucide-react';
import { LaporanDetailSheet } from '../laporan/LaporanDetailSheet';
import { useRealtimeLaporan } from '@/hooks/useRealtimeLaporan';
import { supabase } from '@/lib/supabase';
import { getDisplayJenisKejadian } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TablePageSkeleton } from "@/components/shared/SkeletonLoaders";

export default function RiwayatPage() {
  const [jenisFilter, setJenisFilter] = useState('semua');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedLaporanId, setSelectedLaporanId] = useState<number | null>(null);
  
  // Hard Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { laporanList, loading, refetch } = useRealtimeLaporan();

  if (loading) {
    return <TablePageSkeleton />;
  }

  // Filter Data (hanya yang selesai/ditolak)
  let filteredData = laporanList.filter(l => l.status === 'selesai' || l.status === 'ditolak');

  if (jenisFilter !== 'semua') {
    filteredData = filteredData.filter(l => l.jenis_kejadian === jenisFilter);
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleHardDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    
    // Hard delete directly from Supabase
    const { error } = await supabase
      .from('laporan')
      .delete()
      .eq('id', deleteConfirmId);
      
    if (!error) {
      refetch();
    } else {
      console.error("Gagal menghapus permanen", error);
    }
    
    setIsDeleting(false);
    setDeleteConfirmId(null);
  };

  const columns = [
    { header: 'ID', accessorKey: 'id' as any },
    { 
      header: 'Selesai Pada', 
      cell: (item: any) => new Date(item.updated_at).toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      }) 
    },
    { header: 'Pelapor', cell: (item: any) => item.pelapor_nama || '-' },
    { header: 'Jenis', cell: (item: any) => <span className="capitalize">{getDisplayJenisKejadian(item.jenis_kejadian, item.deskripsi) || '-'}</span> },
    { 
      header: 'Petugas', 
      cell: (item: any) => {
        // Ambil penugasan terakhir jika ada
        if (item.penugasan && item.penugasan.length > 0) {
          const lastPenugasan = item.penugasan[item.penugasan.length - 1];
          return lastPenugasan.petugas?.nama || '-';
        }
        return '-';
      } 
    },
    { header: 'Status', cell: (item: any) => <BadgeStatus status={item.status} /> },
    { 
      header: 'Aksi', 
      cell: (item: any) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setSelectedLaporanId(item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeleteConfirmId(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
        <Select value={jenisFilter} onValueChange={(val) => { setJenisFilter(val ?? 'semua'); setPage(1); }}>
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
      />

      {/* AlertDialog for Hard Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-2xl border-red-100">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-4 w-fit">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl text-red-700">Hapus Permanen?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 mt-2">
              Tindakan ini akan memusnahkan riwayat laporan ini dari database Supabase secara permanen. Tindakan ini <b>TIDAK BISA DIBATALKAN</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex sm:justify-center gap-3">
            <AlertDialogCancel className="mt-0 w-full sm:w-32 border-gray-200">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleHardDelete();
              }} 
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto px-6"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Musnahkan Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
