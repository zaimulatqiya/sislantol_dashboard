"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { mockPetugas } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, UserX, Search } from "lucide-react";
import { Petugas } from "@/types";

export default function PetugasPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<Petugas[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    noHp: "",
    pos: "",
  });

  const [editFormData, setEditFormData] = useState({
    nama: "",
    email: "",
    password: "",
    noHp: "",
    pos: "",
  });

  // Load data dari localStorage di awal, atau gunakan data palsu (mockPetugas)
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("petugas_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length !== mockPetugas.length || (parsed.length > 0 && parsed[0].pos === undefined)) {
          setData([...mockPetugas]);
        } else {
          // Normalisasi status jika ada data lama yang salah tipe
          const normalized = parsed.map((p: any) => ({
            ...p,
            status: p.status === 'Sedang Bertugas' ? 'Bertugas' : p.status
          }));
          setData(normalized);
        }
      } catch {
        setData([...mockPetugas]);
      }
    } else {
      setData([...mockPetugas]);
    }
  }, []);

  // Simpan data ke localStorage setiap kali data berubah
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("petugas_data", JSON.stringify(data));
    }
  }, [data, isMounted]);
  const columns = [
    { header: "Nama", accessorKey: "nama" as any },
    { header: "Email", accessorKey: "email" as any },
    { header: "Password", accessorKey: "password" as any },
    { header: "No HP", accessorKey: "noHp" as any },
    { header: "Pos", accessorKey: "pos" as any },
    {
      header: "Status",
      cell: (item: Petugas) => (
        <Badge variant={item.status === "Tersedia" ? "outline" : "secondary"} className={item.status === "Tersedia" ? "text-green-600 border-green-200 bg-green-50" : ""}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      cell: (item: Petugas) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEditClick = (petugas: Petugas) => {
    setEditId(petugas.id);
    setEditFormData({
      nama: petugas.nama,
      email: petugas.email,
      password: petugas.password || "",
      noHp: petugas.noHp,
      pos: petugas.pos || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData(data.map((item) => (item.id === editId ? { ...item, ...editFormData } : item)));
    setIsEditOpen(false);
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus petugas ini?")) {
      setData(data.filter((item) => item.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newPetugas: Petugas = {
      id: `p${data.length + 1}`,
      nama: formData.nama,
      email: formData.email,
      password: formData.password,
      noHp: formData.noHp,
      pos: formData.pos,
      status: "Tersedia",
    };
    setData([...data, newPetugas]);
    setIsAddOpen(false);
    setFormData({ nama: "", email: "", password: "", noHp: "", pos: "" });
  };

  const filteredData = data.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase()) || (item.pos || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (!isMounted) return null; // Mencegah tampilan berkedip sebelum localStorage termuat (Hydration safe)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manajemen Petugas"
        description="Kelola data petugas lapangan."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama atau pos..."
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
            <SelectItem value="Tersedia">Tersedia</SelectItem>
            <SelectItem value="Bertugas">Bertugas</SelectItem>
            <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shrink-0" />}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Petugas
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Petugas Baru</DialogTitle>
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
                <Input id="pos" required value={formData.pos} onChange={(e) => setFormData({ ...formData, pos: e.target.value })} placeholder="Contoh: Satelit" />
              </div>
              <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                Simpan Petugas
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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

      {/* Modal / Dialog Edit */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Data Petugas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Lengkap</Label>
              <Input id="edit-nama" required value={editFormData.nama} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" required value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input id="edit-password" type="text" required value={editFormData.password} onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-noHp">Nomor HP</Label>
              <Input id="edit-noHp" required value={editFormData.noHp} onChange={(e) => setEditFormData({ ...editFormData, noHp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pos">Pos / Lokasi Standby</Label>
              <Input id="edit-pos" required value={editFormData.pos} onChange={(e) => setEditFormData({ ...editFormData, pos: e.target.value })} />
            </div>
            <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Simpan Perubahan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
