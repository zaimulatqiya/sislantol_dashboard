"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, UserX, Search, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { useRealtimePetugas, PetugasDB } from "@/hooks/useRealtimePetugas";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
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

export default function PetugasPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const itemsPerPage = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { petugasList, loading, refetch } = useRealtimePetugas();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    noHp: "",
    pos: "",
  });

  const [editFormData, setEditFormData] = useState({
    nama: "",
    noHp: "",
    status_petugas: "Tersedia" as any,
    is_active: true,
  });

  const columns = [
    { header: "Nama Lengkap", accessorKey: "nama" as any },
    { header: "No HP", accessorKey: "no_hp" as any },
    {
      header: "Status",
      cell: (item: PetugasDB) => {
        if (!item.is_active) {
          return <Badge variant="secondary" className="text-gray-600 bg-gray-100">Tidak Aktif</Badge>;
        }
        return (
          <Badge variant={item.status_petugas === "Tersedia" ? "outline" : "secondary"} className={item.status_petugas === "Tersedia" ? "text-green-600 border-green-200 bg-green-50" : ""}>
            {item.status_petugas}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      cell: (item: PetugasDB) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 cursor-pointer" onClick={() => handleEditClick(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => setDeleteId(item.id)}>
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEditClick = (petugas: PetugasDB) => {
    setEditId(petugas.id);
    setEditFormData({
      nama: petugas.nama,
      noHp: petugas.no_hp || "",
      status_petugas: petugas.status_petugas,
      is_active: petugas.is_active,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setIsSubmitting(true);

    try {
      await supabase.from("profiles").update({
        nama: editFormData.nama,
        no_hp: editFormData.noHp,
        status_petugas: editFormData.status_petugas,
        is_active: editFormData.is_active,
      }).eq("id", editId);
      
      toast.success("Profil petugas berhasil diperbarui");
      setIsEditOpen(false);
      setEditId(null);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal memperbarui profil petugas: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/petugas?id=${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      toast.success("Petugas berhasil dihapus");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error("Gagal menghapus petugas: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/petugas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("Petugas berhasil didaftarkan!");
      setIsAddOpen(false);
      setFormData({ nama: "", email: "", password: "", noHp: "", pos: "" });
      refetch();
    } catch (error: any) {
      toast.error("Gagal mendaftarkan petugas: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

  const filteredData = petugasList.filter((item) => {
    const matchSearch = item.nama?.toLowerCase().includes(search.toLowerCase());
    
    let matchStatus = true;
    if (statusFilter !== "semua") {
      if (statusFilter === "Tidak Aktif") {
        matchStatus = !item.is_active;
      } else {
        matchStatus = item.is_active && item.status_petugas === statusFilter;
      }
    }
    
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manajemen Petugas"
        description="Kelola akun dan status operasional petugas lapangan."
      />

      <TableToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        onRefresh={refetch}
        searchPlaceholder="Cari nama atau telepon..."
      >
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val ?? 'semua'); setPage(1); }}>
          <SelectTrigger className="w-full lg:w-[180px] bg-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="Tersedia">Tersedia</SelectItem>
            <SelectItem value="Bertugas">Bertugas</SelectItem>
            <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 shrink-0 cursor-pointer" />}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Petugas
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Daftarkan Petugas Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password Sementara</Label>
                <Input id="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noHp">Nomor HP</Label>
                <Input id="noHp" required value={formData.noHp} onChange={(e) => setFormData({ ...formData, noHp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos">Pos / Lokasi Standby</Label>
                <Input id="pos" value={formData.pos} onChange={(e) => setFormData({ ...formData, pos: e.target.value })} placeholder="Opsional" />
              </div>
              <Button disabled={isSubmitting} type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 cursor-pointer">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Buat Akun Petugas"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </TableToolbar>

      <div className="flex justify-between items-center text-sm font-medium text-gray-500 pb-1">
        <span>Menampilkan <span className="text-gray-900 font-bold">{filteredData.length}</span> petugas.</span>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        pagination={{
          page,
          totalPages: totalPages === 0 ? 1 : totalPages,
          onPageChange: setPage,
        }}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profil Petugas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Lengkap</Label>
              <Input id="edit-nama" required value={editFormData.nama} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-noHp">Nomor HP</Label>
              <Input id="edit-noHp" required value={editFormData.noHp} onChange={(e) => setEditFormData({ ...editFormData, noHp: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status Operasional</Label>
              <Select value={editFormData.status_petugas} onValueChange={(val: any) => setEditFormData({ ...editFormData, status_petugas: val })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="Tersedia">Tersedia</SelectItem>
                  <SelectItem value="Bertugas">Bertugas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2 border-t mt-4">
              <Label htmlFor="edit-active">Akses Akun</Label>
              <Select value={editFormData.is_active ? "true" : "false"} onValueChange={(val: any) => setEditFormData({ ...editFormData, is_active: val === "true" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Akses" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="true">Aktif (Dapat Login)</SelectItem>
                  <SelectItem value="false">Dinonaktifkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button disabled={isSubmitting} type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 cursor-pointer">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Hapus Petugas?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 text-base">
              Tindakan ini akan <strong>menghapus akun login</strong> petugas secara permanen dari sistem. Anda yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className='cursor-pointer'>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Ya, Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
