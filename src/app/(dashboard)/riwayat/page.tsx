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
import toast from 'react-hot-toast';
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
import { TableToolbar } from "@/components/shared/TableToolbar";

export default function RiwayatPage() {
  const [search, setSearch] = useState('');
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

  if (search.trim() !== '') {
    filteredData = filteredData.filter(l => 
      (l.pelapor_nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.lokasi || '').toLowerCase().includes(search.toLowerCase())
    );
  }

  if (jenisFilter !== 'semua') {
    filteredData = filteredData.filter(l => l.jenis_kejadian === jenisFilter);
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleHardDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    
    try {
      // 1. Hapus penugasan terkait terlebih dahulu untuk menghindari Foreign Key Constraint error
      const { error: errPenugasan } = await supabase
        .from('penugasan')
        .delete()
        .eq('laporan_id', deleteConfirmId);
        
      if (errPenugasan) {
        throw new Error("Gagal menghapus penugasan terkait: " + errPenugasan.message);
      }

      // 2. Hard delete laporan directly from Supabase
      const { error } = await supabase
        .from('laporan')
        .delete()
        .eq('id', deleteConfirmId);
        
      if (error) {
        throw new Error("Gagal menghapus laporan: " + error.message);
      }
      
      toast.success("Riwayat laporan berhasil dimusnahkan.");
      refetch();
      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error("Exception saat menghapus permanen:", error);
      toast.error(error.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
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
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
            onClick={() => setSelectedLaporanId(item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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

      <TableToolbar
        searchQuery={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onRefresh={refetch}
        searchPlaceholder="Cari nama pelapor atau lokasi..."
      >
        <Select value={jenisFilter} onValueChange={(val) => { setJenisFilter(val ?? 'semua'); setPage(1); }}>
          <SelectTrigger className="w-full lg:w-[200px] bg-white">
            <SelectValue placeholder="Filter Jenis..." />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Semua Kejadian</SelectItem>
            <SelectItem value="mogok">Mogok</SelectItem>
            <SelectItem value="kecelakaan">Kecelakaan</SelectItem>
            <SelectItem value="hambatan">Hambatan</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </TableToolbar>

      <div className="flex justify-between items-center text-sm font-medium text-gray-500 pb-1 pt-2">
        <span>Menampilkan <span className="text-gray-900 font-bold">{filteredData.length}</span> riwayat laporan.</span>
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
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Hapus Permanen?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 text-base">
              Tindakan ini akan memusnahkan riwayat laporan ini dari database secara permanen. Tindakan ini <strong>TIDAK BISA DIBATALKAN</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleHardDelete();
              }} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              {isDeleting ? "Menghapus..." : "Ya, Musnahkan Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
