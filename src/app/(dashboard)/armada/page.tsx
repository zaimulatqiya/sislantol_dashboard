"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { mockArmada } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2, Search } from "lucide-react";
import { Armada, JenisArmada } from "@/types";

export default function ArmadaPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<Armada[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 5;
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");

  const [formData, setFormData] = useState({
    nama: "",
    jenis: "derek" as JenisArmada,
    nopol: "",
    pos: "",
  });

  const [editFormData, setEditFormData] = useState({
    nama: "",
    jenis: "derek" as JenisArmada,
    nopol: "",
    pos: "",
  });

  // Load data dari localStorage di awal, atau gunakan data palsu (mockArmada)
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("armada_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Jika data dari localStorage adalah versi lama (belum ada 'pos'), gunakan mock data baru
        if (parsed.length > 0 && parsed[0].pos === undefined) {
          setData([...mockArmada]);
        } else {
          setData(parsed);
        }
      } catch {
        setData([...mockArmada]);
      }
    } else {
      setData([...mockArmada]);
    }
  }, []);

  // Simpan data ke localStorage setiap kali data berubah
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("armada_data", JSON.stringify(data));
    }
  }, [data, isMounted]);

  const columns = [
    { header: "Nama Armada", accessorKey: "nama" as any },
    {
      header: "Jenis",
      cell: (item: Armada) => (
        <Badge variant="outline" className="capitalize border-blue-200 bg-blue-50 text-blue-700">
          {item.jenis}
        </Badge>
      ),
    },
    { header: "Nomor Polisi", accessorKey: "nopol" as any },
    { header: "Pos", accessorKey: "pos" as any },
    {
      header: "Status",
      cell: (item: Armada) => (
        <Badge variant={item.status === "Tersedia" ? "outline" : "secondary"} className={item.status === "Tersedia" ? "text-green-600 border-green-200 bg-green-50" : ""}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      cell: (item: Armada) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEditClick = (armada: Armada) => {
    setEditId(armada.id);
    setEditFormData({
      nama: armada.nama,
      jenis: armada.jenis,
      nopol: armada.nopol,
      pos: armada.pos || "",
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
    if (window.confirm("Apakah Anda yakin ingin menghapus armada ini?")) {
      setData(data.filter((item) => item.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newArmada: Armada = {
      id: `a${data.length + 1}`,
      nama: formData.nama,
      jenis: formData.jenis,
      nopol: formData.nopol,
      pos: formData.pos,
      status: "Tersedia",
    };
    setData([...data, newArmada]);
    setIsAddOpen(false);
    setFormData({ nama: "", jenis: "derek", nopol: "", pos: "" });
  };

  // Filter Data
  const filteredData = data.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase()) || 
                        item.nopol.toLowerCase().includes(search.toLowerCase()) || 
                        (item.pos || "").toLowerCase().includes(search.toLowerCase());
    const matchJenis = jenisFilter === "semua" || item.jenis === jenisFilter;
    const matchStatus = statusFilter === "semua" || item.status === statusFilter;
    return matchSearch && matchJenis && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (!isMounted) return null; // Hydration safe

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manajemen Armada"
        description="Kelola kendaraan derek dan patroli."
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
                <Select value={formData.jenis} onValueChange={(val: JenisArmada) => setFormData({ ...formData, jenis: val })}>
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
                <Label htmlFor="pos">Pos</Label>
                <Input id="pos" required value={formData.pos} onChange={(e) => setFormData({ ...formData, pos: e.target.value })} placeholder="Contoh: Pos 1 Waru" />
              </div>
              <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                Simpan Armada
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
            <DialogTitle>Edit Data Armada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Armada</Label>
              <Input id="edit-nama" required value={editFormData.nama} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} placeholder="Contoh: Derek Besar 03" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-jenis">Jenis</Label>
              <Select value={editFormData.jenis} onValueChange={(val: JenisArmada) => setEditFormData({ ...editFormData, jenis: val })}>
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
              <Input id="edit-nopol" required value={editFormData.nopol} onChange={(e) => setEditFormData({ ...editFormData, nopol: e.target.value })} placeholder="Contoh: L 1234 AB" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pos">Pos</Label>
              <Input id="edit-pos" required value={editFormData.pos} onChange={(e) => setEditFormData({ ...editFormData, pos: e.target.value })} placeholder="Contoh: Pos 1 Waru" />
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
