"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2, Search, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { useRealtimeArmada, ArmadaDB } from "@/hooks/useRealtimeArmada";
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

export default function ArmadaPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 5;
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { armadaList, loading, refetch } = useRealtimeArmada();

  const [formData, setFormData] = useState({
    nama: "",
    jenis: "derek" as any,
    nopol: "",
    pos: "",
  });

  const [editFormData, setEditFormData] = useState({
    nama: "",
    jenis: "derek" as any,
    nopol: "",
    pos: "",
    status: "Tersedia" as any,
  });

  const columns = [
    { header: "Nama Armada", accessorKey: "nama_armada" as any },
    {
      header: "Jenis",
      cell: (item: ArmadaDB) => (
        <Badge variant="outline" className="capitalize border-blue-200 bg-blue-50 text-blue-700">
          {item.jenis}
        </Badge>
      ),
    },
    { header: "Nomor Polisi", accessorKey: "nopol" as any },
    { header: "Pos", accessorKey: "pos" as any },
    {
      header: "Status",
      cell: (item: ArmadaDB) => (
        <Badge variant={item.status === "Tersedia" ? "outline" : "secondary"} className={item.status === "Tersedia" ? "text-green-600 border-green-200 bg-green-50" : ""}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      cell: (item: ArmadaDB) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => setDeleteId(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEditClick = (armada: ArmadaDB) => {
    setEditId(armada.id);
    setEditFormData({
      nama: armada.nama_armada,
      jenis: armada.jenis,
      nopol: armada.nopol,
      pos: armada.pos || "",
      status: armada.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setIsSubmitting(true);
    
    try {
      await supabase.from("armada").update({
        nama_armada: editFormData.nama,
        jenis: editFormData.jenis,
        nopol: editFormData.nopol,
        pos: editFormData.pos,
        status: editFormData.status,
      }).eq("id", editId);

      toast.success("Data armada berhasil diperbarui");
      setIsEditOpen(false);
      setEditId(null);
      refetch();
    } catch (error: any) {
      toast.error("Gagal memperbarui armada: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await supabase.from("armada").delete().eq("id", deleteId);
      toast.success("Armada berhasil dihapus");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error("Gagal menghapus armada: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await supabase.from("armada").insert({
        nama_armada: formData.nama,
        jenis: formData.jenis,
        nopol: formData.nopol,
        pos: formData.pos,
        status: "Tersedia",
      });

      toast.success("Armada baru berhasil ditambahkan!");
      setIsAddOpen(false);
      setFormData({ nama: "", jenis: "derek" as any, nopol: "", pos: "" });
      refetch();
    } catch (error: any) {
      toast.error("Gagal menambahkan armada: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

  // Filter Data
  const filteredData = armadaList.filter((item) => {
    const matchSearch = (item.nama_armada || "").toLowerCase().includes(search.toLowerCase()) || 
                        (item.nopol || "").toLowerCase().includes(search.toLowerCase()) || 
                        (item.pos || "").toLowerCase().includes(search.toLowerCase());
    const matchJenis = jenisFilter === "semua" || item.jenis === jenisFilter;
    const matchStatus = statusFilter === "semua" || item.status === statusFilter;
    return matchSearch && matchJenis && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manajemen Armada"
        description="Kelola kendaraan derek dan patroli yang terhubung langsung dengan database."
      />

      <div className="flex flex-col lg:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari nama, nopol, atau pos..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>

        <Select
          value={jenisFilter}
          onValueChange={(val) => {
            setJenisFilter(val ?? "semua");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-[160px] bg-white">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Semua Jenis</SelectItem>
            <SelectItem value="derek">Derek</SelectItem>
            <SelectItem value="patroli">Patroli</SelectItem>
            <SelectItem value="towing">Towing</SelectItem>
            <SelectItem value="ambulan">Mobil Ambulan</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val ?? "semua");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-[160px] bg-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="Tersedia">Tersedia</SelectItem>
            <SelectItem value="Digunakan">Digunakan</SelectItem>
            <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="w-full lg:w-auto shrink-0 bg-blue-600 hover:bg-blue-700" />}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Armada
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Armada Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Armada</Label>
                <Input id="nama" required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Derek Besar 03" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis</Label>
                <Select value={formData.jenis} onValueChange={(val: any) => setFormData({ ...formData, jenis: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="derek">Derek</SelectItem>
                    <SelectItem value="patroli">Patroli</SelectItem>
                    <SelectItem value="towing">Towing</SelectItem>
                    <SelectItem value="ambulan">Mobil Ambulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nopol">Nomor Polisi</Label>
                <Input id="nopol" required value={formData.nopol} onChange={(e) => setFormData({ ...formData, nopol: e.target.value })} placeholder="Contoh: L 1234 AB" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos">Pos / Lokasi</Label>
                <Input id="pos" required value={formData.pos} onChange={(e) => setFormData({ ...formData, pos: e.target.value })} placeholder="Contoh: Pos 1 Waru" />
              </div>
              <Button disabled={isSubmitting} type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Menyimpan..." : "Simpan Armada"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center text-sm font-medium text-gray-500 pb-1">
        <span>Menampilkan <span className="text-gray-900 font-bold">{filteredData.length}</span> armada.</span>
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
            <DialogTitle>Edit Data Armada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Armada</Label>
              <Input id="edit-nama" required value={editFormData.nama} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-jenis">Jenis</Label>
              <Select value={editFormData.jenis} onValueChange={(val: any) => setEditFormData({ ...editFormData, jenis: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="derek">Derek</SelectItem>
                  <SelectItem value="patroli">Patroli</SelectItem>
                  <SelectItem value="towing">Towing</SelectItem>
                  <SelectItem value="ambulan">Mobil Ambulan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nopol">Nomor Polisi</Label>
              <Input id="edit-nopol" required value={editFormData.nopol} onChange={(e) => setEditFormData({ ...editFormData, nopol: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pos">Pos</Label>
              <Input id="edit-pos" required value={editFormData.pos} onChange={(e) => setEditFormData({ ...editFormData, pos: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editFormData.status} onValueChange={(val: any) => setEditFormData({ ...editFormData, status: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tersedia">Tersedia</SelectItem>
                  <SelectItem value="Digunakan">Digunakan</SelectItem>
                  <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button disabled={isSubmitting} type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
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
              <AlertDialogTitle className="text-xl">Hapus Armada?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 text-base">
              Anda yakin ingin menghapus data armada ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Ya, Hapus Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
