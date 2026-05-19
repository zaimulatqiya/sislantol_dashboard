"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockLaporan, mockPetugas, mockArmada, mockPenugasan } from "@/data/mockData";
import { PageHeader } from "@/components/shared/PageHeader";
import { BadgeStatus } from "@/components/shared/BadgeStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ArrowLeft, CheckCircle, MapPin, Phone, User, Clock, Image as ImageIcon, XCircle, HardHat, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { StatusLaporan, Petugas, Armada, StatusPetugas, Laporan } from "@/types";

export default function LaporanDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Real app should fetch this from Context/API. We use local state to simulate updates.
  const [laporan, setLaporan] = useState<Laporan | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [units, setUnits] = useState([{ armadaId: "", petugasId: "" }]);
  const [catatan, setCatatan] = useState("");

  const [petugasData, setPetugasData] = useState<Petugas[]>([]);
  const [armadaData, setArmadaData] = useState<Armada[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const savedLaporan = localStorage.getItem("laporan_data");
    let currentLaporan = mockLaporan.find((l) => l.id === params.id) ?? null;
    if (savedLaporan) {
      try {
        const parsed = JSON.parse(savedLaporan);
        const found = parsed.find((l: any) => l.id === params.id);
        if (found) currentLaporan = found;
      } catch (e) {}
    }
    setLaporan(currentLaporan);

    const savedPetugas = localStorage.getItem("petugas_data");
    if (savedPetugas) {
      try {
        setPetugasData(JSON.parse(savedPetugas));
      } catch {
        setPetugasData([...mockPetugas]);
      }
    } else {
      setPetugasData([...mockPetugas]);
    }

    const savedArmada = localStorage.getItem("armada_data");
    if (savedArmada) {
      try {
        const parsed = JSON.parse(savedArmada);
        if (parsed.length > 0 && parsed[0].pos === undefined) {
          setArmadaData([...mockArmada]);
        } else {
          setArmadaData(parsed);
        }
      } catch {
        setArmadaData([...mockArmada]);
      }
    } else {
      setArmadaData([...mockArmada]);
    }
  }, []);

  if (!isMounted || !laporan) {
    if (!isMounted) return null;
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold">Laporan tidak ditemukan!</h2>
        <Button variant="link" onClick={() => router.push("/laporan")}>
          Kembali
        </Button>
      </div>
    );
  }

  const handleUpdateStatus = (newStatus: StatusLaporan, additionalUpdates: any = {}) => {
    // Update local state
    const newHistory = [...laporan.riwayat, { status: newStatus, waktu: new Date().toISOString() }];
    const updatedLaporan = { ...laporan, status: newStatus, riwayat: newHistory, ...additionalUpdates };
    setLaporan(updatedLaporan);

    // Persist to localStorage
    const saved = localStorage.getItem("laporan_data");
    let allLaporan = [...mockLaporan];
    if (saved) {
      try {
        allLaporan = JSON.parse(saved);
      } catch {}
    }
    const index = allLaporan.findIndex((l) => l.id === updatedLaporan.id);
    if (index !== -1) {
      allLaporan[index] = updatedLaporan;
    } else {
      allLaporan.push(updatedLaporan);
    }
    localStorage.setItem("laporan_data", JSON.stringify(allLaporan));
  };

  const handleVerify = () => {
    handleUpdateStatus("diverifikasi");
    setIsVerifying(false);
  };

  const handleReject = () => {
    handleUpdateStatus("ditolak", { alasanDitolak: rejectReason });
    setIsRejecting(false);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const validUnits = units.filter((u) => u.armadaId && u.petugasId);
    if (validUnits.length === 0) return;

    handleUpdateStatus("ditugaskan", {
      penugasan: validUnits,
      petugasId: validUnits[0]?.petugasId,
      armadaId: validUnits[0]?.armadaId,
      catatanPenugasan: catatan,
    });

    // Save Penugasan to localStorage
    const savedPenugasan = localStorage.getItem("penugasan_data");
    let allPenugasan = savedPenugasan ? JSON.parse(savedPenugasan) : [...mockPenugasan];
    
    const newPenugasanEntries = validUnits.map((u, idx) => ({
      id: `TUG-${Date.now()}-${idx}`,
      laporanId: laporan.id,
      petugasId: u.petugasId,
      armadaId: u.armadaId,
      waktuDitugaskan: new Date().toISOString(),
      status: 'aktif'
    }));

    allPenugasan = [...allPenugasan, ...newPenugasanEntries];
    localStorage.setItem("penugasan_data", JSON.stringify(allPenugasan));

    // Update Petugas & Armada statuses
    const newPetugasData = petugasData.map(p => 
      validUnits.some(u => u.petugasId === p.id) ? { ...p, status: 'Bertugas' as StatusPetugas } : p
    );
    setPetugasData(newPetugasData);
    localStorage.setItem("petugas_data", JSON.stringify(newPetugasData));

    const newArmadaData = armadaData.map(a => 
      validUnits.some(u => u.armadaId === a.id) ? { ...a, status: 'Digunakan' as const } : a
    );
    setArmadaData(newArmadaData);
    localStorage.setItem("armada_data", JSON.stringify(newArmadaData));

    // Redirect to penugasan page
    router.push("/penugasan");
  };

  const assignedPetugas = mockPetugas.find((p) => p.id === laporan.petugasId);
  const assignedArmada = mockArmada.find((a) => a.id === laporan.armadaId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link href="/laporan" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Laporan Masuk
      </Link>

      <PageHeader title={`Detail Laporan ${laporan.id}`} action={<BadgeStatus status={laporan.status} className="text-sm px-3 py-1" />} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: INFO LAPORAN */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Kejadian</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Pelapor
                  </div>
                  <div className="font-medium text-gray-900">{laporan.pelaporNama}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> No. HP
                  </div>
                  <div className="font-medium text-gray-900">{laporan.pelaporNoHp}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Waktu Laporan
                  </div>
                  <div className="font-medium text-gray-900">{new Date(laporan.createdAt).toLocaleString("id-ID")}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" /> Lokasi
                  </div>
                  <div className="font-medium text-gray-900">{laporan.lokasi}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-sm text-gray-500 mb-1">Jenis Kejadian</div>
                  <div className="font-medium text-gray-900 capitalize px-3 py-1 bg-gray-100 inline-block rounded-md">{laporan.jenisKejadian}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-sm text-gray-500 mb-1">Deskripsi</div>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{laporan.deskripsi}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIWAYAT */}
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Riwayat Status</h3>
              <div className="space-y-4">
                {laporan.riwayat.map((riwayat, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 ring-4 ring-blue-50"></div>
                      {index !== laporan.riwayat.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <BadgeStatus status={riwayat.status} />
                        <span className="text-xs text-gray-500">{new Date(riwayat.waktu).toLocaleString("id-ID")}</span>
                      </div>
                      {riwayat.keterangan && <p className="text-sm text-gray-600 mt-1">{riwayat.keterangan}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {laporan.status === "selesai" && (
            <Card className="shadow-sm border-green-100 bg-green-50/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-600 w-5 h-5" /> Laporan Selesai
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-500">Catatan Penutup Petugas</Label>
                    <p className="mt-1 font-medium">{laporan.catatanPenutup || "Tidak ada catatan"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 flex items-center gap-1.5 mb-2">
                      <ImageIcon className="w-4 h-4" /> Foto Bukti Selesai
                    </Label>
                    <div className="w-full sm:w-64 h-40 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-sm text-gray-400">Placeholder Foto Bukti</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {laporan.status === "ditolak" && (
            <Card className="shadow-sm border-red-100 bg-red-50/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="text-red-600 w-5 h-5" /> Laporan Ditolak
                </h3>
                <p className="text-red-800">
                  <strong>Alasan:</strong> {laporan.alasanDitolak}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* KOLOM KANAN: AKSI */}
        <div className="space-y-6">
          {laporan.status === "menunggu" && (
            <Card className="shadow-sm border-blue-100 bg-blue-50/50 sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Aksi Verifikasi</h3>
                <p className="text-sm text-gray-600">Terima dan teruskan laporan ini, atau tolak jika tidak valid (prank).</p>
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setIsVerifying(true)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Verifikasi Laporan
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsRejecting(true)}>
                    <XCircle className="w-4 h-4 mr-2" /> Tolak Laporan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {laporan.status === "diverifikasi" && (
            <Card className="shadow-sm border-yellow-100 bg-yellow-50/30 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Penugasan Petugas</h3>
                <form onSubmit={handleAssign} className="space-y-4">
                  <div className="space-y-4 p-5 bg-white/50 border border-gray-100 rounded-xl">
                    {units.map((unit, index) => {
                      const selectedArmadaData = armadaData.find((a) => a.id === unit.armadaId);
                      const availablePetugas = selectedArmadaData ? petugasData.filter((p) => p.status === "Tersedia" && p.pos === selectedArmadaData.pos) : [];

                      return (
                        <div key={index} className="relative space-y-4 pb-5 mb-5 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-yellow-800 bg-yellow-100 px-3 py-1 rounded-md">
                              Unit Kendaraan #{index + 1}
                            </span>
                            {units.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newUnits = [...units];
                                  newUnits.splice(index, 1);
                                  setUnits(newUnits);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium transition-colors"
                              >
                                Hapus Unit
                              </button>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                              <Label className="text-gray-700">Pilih Armada (Tersedia)</Label>
                              <Select
                                required
                                value={unit.armadaId}
                                onValueChange={(val) => {
                                  const newUnits = [...units];
                                  newUnits[index].armadaId = val ?? "";
                                  newUnits[index].petugasId = ""; // Reset petugas
                                  setUnits(newUnits);
                                }}
                              >
                                <SelectTrigger className="bg-white border-gray-200 shadow-sm h-10 w-full">
                                  {selectedArmadaData ? (
                                    <span className="truncate flex-1 text-left">{selectedArmadaData.nama}</span>
                                  ) : (
                                    <SelectValue placeholder="Pilih Armada terdekat..." />
                                  )}
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false} className="max-w-[400px] max-h-56 overflow-y-auto">
                                  {armadaData
                                    .filter((a) => a.status === "Tersedia")
                                    .map((a) => (
                                      <SelectItem key={a.id} value={a.id} className="py-2 cursor-pointer">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-medium text-gray-900">{a.nama}</span>
                                          <span className="text-xs text-gray-500">
                                            {a.nopol} • {a.jenis} • {a.pos}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700">
                                Pilih Petugas {selectedArmadaData ? <span className="text-yellow-600 font-medium">(Di {selectedArmadaData.pos})</span> : ""}
                              </Label>
                              <Select
                                required
                                disabled={!unit.armadaId}
                                value={unit.petugasId}
                                onValueChange={(val) => {
                                  const newUnits = [...units];
                                  newUnits[index].petugasId = val ?? "";
                                  setUnits(newUnits);
                                }}
                              >
                                <SelectTrigger className={`bg-white border-gray-200 shadow-sm h-10 ${!unit.armadaId ? "opacity-50 bg-gray-50 cursor-not-allowed" : ""}`}>
                                  {unit.petugasId ? (
                                    <span className="truncate flex-1 text-left">{petugasData.find((p) => p.id === unit.petugasId)?.nama}</span>
                                  ) : (
                                    <SelectValue placeholder={unit.armadaId ? "Pilih Petugas..." : "Pilih armada terlebih dahulu"} />
                                  )}
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false} className="max-h-56 overflow-y-auto">
                                  {availablePetugas.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                                      {p.nama}
                                    </SelectItem>
                                  ))}
                                  {availablePetugas.length === 0 && unit.armadaId && (
                                    <div className="p-3 text-sm text-gray-500 text-center italic">Tidak ada petugas tersedia di pos ini</div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-dashed border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50/50 mt-2 h-10" 
                      onClick={() => setUnits([...units, { armadaId: "", petugasId: "" }])}
                    >
                      + Tambah Unit Lain
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catatan">Catatan untuk Semua Petugas</Label>
                    <Textarea id="catatan" placeholder="Instruksi tambahan jika ada..." className="resize-none bg-white" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                  </div>

                  <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Zap className="w-4 h-4 mr-2" /> Terjunkan {units.length} Unit
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {(laporan.status === "ditugaskan" || laporan.status === "proses") && (
            <Card className="shadow-sm border-orange-100 bg-orange-50/30 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Info Penugasan</h3>
                <div className="space-y-4">
                  {(laporan.penugasan || [{ petugasId: laporan.petugasId, armadaId: laporan.armadaId }]).map((unit, idx) => {
                    if (!unit.petugasId || !unit.armadaId) return null;
                    const pData = mockPetugas.find((p) => p.id === unit.petugasId);
                    const aData = mockArmada.find((a) => a.id === unit.armadaId);

                    return (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-orange-100 space-y-3">
                        <div className="text-xs font-semibold text-orange-800 bg-orange-100 px-2 py-1 rounded inline-block">Unit {idx + 1}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <Truck className="text-orange-600 w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium text-sm">{aData?.nama || "Armada"}</div>
                              <div className="text-xs text-gray-500 capitalize">
                                {aData?.jenis} • {aData?.nopol}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <HardHat className="text-orange-600 w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium text-sm">{pData?.nama || "Petugas"}</div>
                              <div className="text-xs text-gray-500">{pData?.noHp}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t border-orange-100">
                    <Label className="text-gray-500 text-xs">Catatan Dispatcher</Label>
                    <p className="text-sm font-medium">{laporan.catatanPenugasan || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={isVerifying}
        onOpenChange={setIsVerifying}
        title="Verifikasi Laporan?"
        description={`Anda yakin laporan dari ${laporan.pelaporNama} ini valid dan bukan panggilan palsu?`}
        onConfirm={handleVerify}
        confirmText="Ya, Verifikasi"
      />

      <ConfirmDialog
        open={isRejecting}
        onOpenChange={setIsRejecting}
        title="Tolak Laporan"
        description={
          <div className="space-y-4 mt-4 text-left">
            <p>Masukkan alasan spesifik mengapa laporan ditolak (misal: panggilan palsu, duplikat).</p>
            <Textarea placeholder="Alasan penolakan..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="resize-none" />
          </div>
        }
        onConfirm={handleReject}
        confirmText="Tolak Laporan"
        variant="destructive"
      />
    </div>
  );
}
