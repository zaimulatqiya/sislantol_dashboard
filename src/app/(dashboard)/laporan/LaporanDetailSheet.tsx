"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BadgeStatus } from "@/components/shared/BadgeStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CheckCircle, MapPin, Phone, User, Clock, Image as ImageIcon, XCircle, HardHat, Truck, Zap, X, Loader2, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import toast from "react-hot-toast";
import { getDisplayJenisKejadian, getDisplayDeskripsi } from "@/lib/utils";
import { SheetDetailSkeleton } from "@/components/shared/SkeletonLoaders";
interface LaporanDetailSheetProps {
  laporanId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LaporanDetailSheet({ laporanId, open, onOpenChange, onSuccess }: LaporanDetailSheetProps) {
  const router = useRouter();

  const [laporan, setLaporan] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [units, setUnits] = useState<{armadaId: string; petugasIds: string[]}[]>([{ armadaId: "", petugasIds: [] }]);
  const [catatan, setCatatan] = useState("");
  const [penugasanList, setPenugasanList] = useState<any[]>([]);

  const [petugasData, setPetugasData] = useState<any[]>([]);
  const [armadaData, setArmadaData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAttemptedAssign, setIsAttemptedAssign] = useState(false);

  useEffect(() => {
    if (!laporanId || !open) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. Fetch Laporan
      const { data: laporanData } = await supabase
        .from('laporan')
        .select('*')
        .eq('id', laporanId)
        .single();
        
      setLaporan(laporanData);

      // 2. Fetch Master Data
      const { data: pData } = await supabase.from('profiles').select('*').eq('role', 'petugas');
      const { data: aData } = await supabase.from('armada').select('*');
      
      setPetugasData(pData || []);
      setArmadaData(aData || []);

      // 3. Jika sudah ditugaskan/proses, fetch data penugasan
      if (laporanData && ["ditugaskan", "proses", "selesai"].includes(laporanData.status)) {
        const { data: penugasanData } = await supabase
          .from('penugasan')
          .select(`
            *,
            armada:armada_id (*),
            petugas:petugas_id (*)
          `)
          .eq('laporan_id', laporanId);
        
        setPenugasanList(penugasanData || []);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [laporanId, open]);

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      const updatePromise = supabase.from('laporan').update({ status: 'diverifikasi', updated_at: new Date().toISOString() }).eq('id', laporanId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Koneksi ke database terputus (Timeout 10 detik).")), 10000)
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;
      if (error) throw error;

      if (laporan) {
        setLaporan({ ...laporan, status: 'diverifikasi' });
      }
      
      toast.success("Laporan berhasil diverifikasi. Silakan tugaskan unit.");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Gagal verifikasi: " + error.message);
    } finally {
      setIsVerifying(false);
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const updatePromise = supabase.from('laporan').update({ 
        status: 'ditolak', 
        alasan_tolak: rejectReason,
        updated_at: new Date().toISOString() 
      }).eq('id', laporanId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Koneksi ke database terputus (Timeout 10 detik).")), 10000)
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;
      if (error) throw error;

      toast.success("Laporan berhasil ditolak.");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Gagal menolak laporan: " + error.message);
    } finally {
      setIsRejecting(false);
      setIsSubmitting(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAttemptedAssign(true);
    if (!laporan) return;

    const isFormValid = units.every((u) => u.armadaId && u.petugasIds.length > 0);
    if (!isFormValid) {
      return;
    }
    
    const validUnits: { armadaId: string; petugasId: string }[] = [];
    units.forEach((u) => {
      u.petugasIds.forEach((pid) => {
        validUnits.push({ armadaId: u.armadaId, petugasId: pid });
      });
    });

    setIsSubmitting(true);

    try {
      const { assignPenugasanAction } = await import("@/app/actions/penugasan");
      
      const assignPromise = assignPenugasanAction(laporan.id, validUnits, catatan);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Server tidak merespon (Timeout 10 detik).")), 10000)
      );

      const result = await Promise.race([assignPromise, timeoutPromise]) as any;

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Armada dan Petugas berhasil ditugaskan!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
      // Delay sedikit agar DB commit selesai dan realtime trigger, lalu pindah halaman
      setTimeout(() => {
        router.refresh();
        router.push("/penugasan");
      }, 500);
      
    } catch (error: any) {
      console.error("Error Assigning:", error);
      toast.error("Gagal menugaskan armada: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false} className="w-full !max-w-[50vw] sm:w-[50vw] overflow-y-auto bg-gray-50/50 p-0 sm:p-0">
        {isLoading || !laporan ? (
          <SheetDetailSkeleton />
        ) : (
          <div className="flex flex-col h-full bg-white">
            <SheetHeader className="p-4 sm:p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex flex-row items-start sm:items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="shrink-0 -ml-2 rounded-full hover:bg-gray-100 mt-1 sm:mt-0 cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <SheetTitle className="text-2xl font-bold flex items-center gap-3">
                    Laporan #{laporan.id}
                  </SheetTitle>
                  <SheetDescription>Detail laporan kejadian dari pengguna</SheetDescription>
                </div>
                <div className="mt-0">
                  <BadgeStatus status={laporan.status} className="text-sm px-3 py-1" />
                </div>
              </div>
            </SheetHeader>

            <div className="p-6 space-y-6 flex-1 bg-gray-50/30">
              <div className="space-y-6">
                {/* INFO LAPORAN */}
                <Card className="shadow-sm border-gray-100 bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Kejadian</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                          <User className="w-4 h-4" /> Pelapor
                        </div>
                        <div className="font-medium text-gray-900">{laporan.pelapor_nama}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                          <Phone className="w-4 h-4" /> No. HP
                        </div>
                        <div className="font-medium text-gray-900">{laporan.pelapor_no_hp}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> Waktu Laporan
                        </div>
                        <div className="font-medium text-gray-900">{new Date(laporan.created_at).toLocaleString("id-ID")}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-red-500" /> Lokasi
                        </div>
                        <div className="font-medium text-gray-900">{laporan.lokasi}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-sm text-gray-500 mb-1">Jenis Kejadian</div>
                        <div className="font-medium text-gray-900 capitalize px-3 py-1 bg-gray-100 inline-block rounded-md">{getDisplayJenisKejadian(laporan.jenis_kejadian, laporan.deskripsi)}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-sm text-gray-500 mb-1">Deskripsi</div>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {getDisplayDeskripsi(laporan.jenis_kejadian, laporan.deskripsi) || (
                            <span className="italic text-gray-400">Tidak ada deskripsi tambahan.</span>
                          )}
                        </p>
                      </div>

                      {laporan.foto_urls && laporan.foto_urls.length > 0 && (
                        <div className="sm:col-span-2">
                          <div className="text-sm text-gray-500 mb-2 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4" /> Foto Kejadian ({laporan.foto_urls.length})
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {laporan.foto_urls.map((url: string, idx: number) => (
                              <Dialog key={idx}>
                                <DialogTrigger className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all p-0 bg-gray-100 focus:outline-none flex items-center justify-center shrink-0">
                                  <img src={url} alt={`Foto Kejadian ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-5xl w-[95vw] bg-transparent border-none shadow-none ring-0 p-0" showCloseButton={false}>
                                  <DialogTitle className="sr-only">Preview Foto Kejadian {idx + 1}</DialogTitle>

                                  <DialogClose className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex items-center gap-2 px-5 py-2.5 bg-gray-900/90 hover:bg-gray-950 text-white backdrop-blur-md rounded-full border border-gray-700 transition-all shadow-2xl focus:outline-none group cursor-pointer">
                                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold tracking-wide pr-1">Tutup Preview</span>
                                  </DialogClose>

                                  <div className="relative w-full h-[90vh] flex items-center justify-center">
                                    <img src={url} alt={`Preview Foto Kejadian ${idx + 1}`} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/20" />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AKSI */}
                {laporan.status === "menunggu" && (
                  <Card className="shadow-sm border-blue-100 bg-blue-50/50">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Aksi Verifikasi</h3>
                      <p className="text-sm text-gray-600">Terima dan teruskan laporan ini, atau tolak jika tidak valid (prank).</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button disabled={isSubmitting} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 cursor-pointer" onClick={() => setIsVerifying(true)}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} Verifikasi Laporan
                        </Button>
                        <Button disabled={isSubmitting} variant="outline" className="w-full sm:flex-1 text-red-600 border-red-200 hover:bg-red-50 cursor-pointer" onClick={() => setIsRejecting(true)}>
                          <XCircle className="w-4 h-4 mr-2" /> Tolak Laporan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {laporan.status === "diverifikasi" && (
                  <Card className="shadow-sm border-yellow-100 bg-yellow-50/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Penugasan Petugas</h3>
                      <form onSubmit={handleAssign} className="space-y-4" noValidate>
                        <div className="space-y-4 p-5 bg-white/50 border border-gray-100 rounded-xl">
                          {units.map((unit, index) => {
                            const selectedArmadaData = armadaData.find((a) => String(a.id) === String(unit.armadaId));
                            const availablePetugas = selectedArmadaData ? petugasData.filter((p) => (p.status_petugas === "Tersedia" || p.status_petugas === "Bertugas") && p.armada_id === selectedArmadaData.id) : [];

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
                                    <Label className="text-gray-700">Pilih Armada (Tersedia / Digunakan)</Label>
                                    <Select
                                      required
                                      value={unit.armadaId}
                                      onValueChange={(val) => {
                                        const newUnits = [...units];
                                        newUnits[index].armadaId = val ?? "";
                                        newUnits[index].petugasIds = [];
                                        setUnits(newUnits);
                                        setIsAttemptedAssign(false);
                                      }}
                                    >
                                      <SelectTrigger className={`bg-white shadow-sm h-10 w-full ${isAttemptedAssign && !unit.armadaId ? "border-red-400 ring-1 ring-red-400 focus:ring-red-500" : "border-gray-200"}`}>
                                        {selectedArmadaData ? (
                                          <span className="truncate flex-1 text-left flex items-center gap-2">
                                            <span>{selectedArmadaData.nama_armada}</span>
                                            {selectedArmadaData.status !== "Tersedia" && (
                                              <span className="text-[10px] leading-none bg-yellow-100 text-yellow-700 px-1.5 py-1 rounded border border-yellow-200 font-medium">{selectedArmadaData.status}</span>
                                            )}
                                          </span>
                                        ) : (
                                          <SelectValue placeholder="Pilih Armada terdekat..." />
                                        )}
                                      </SelectTrigger>
                                      <SelectContent alignItemWithTrigger={false} className="max-w-[400px] max-h-56 overflow-y-auto">
                                        {armadaData
                                          .filter((a) => a.status === "Tersedia" || a.status === "Digunakan")
                                          .map((a) => (
                                            <SelectItem key={a.id} value={a.id} className="py-2 cursor-pointer">
                                              <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium text-gray-900">{a.nama_armada}</span>
                                                  {a.status !== "Tersedia" && (
                                                    <span className="text-[10px] leading-none bg-yellow-100 text-yellow-700 px-1.5 py-1 rounded border border-yellow-200 font-medium">{a.status}</span>
                                                  )}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                  {a.nopol} • {a.jenis} • {a.pos}
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    {isAttemptedAssign && !unit.armadaId && (
                                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium animate-in slide-in-from-top-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> Wajib memilih armada
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <Label className="text-gray-700">
                                      Pilih Petugas {selectedArmadaData ? <span className="text-yellow-600 font-medium">(Maks. 3 orang)</span> : ""}
                                    </Label>
                                    {!unit.armadaId ? (
                                      <div className="p-3 text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                                        Pilih armada terlebih dahulu untuk melihat daftar petugas.
                                      </div>
                                    ) : availablePetugas.length === 0 ? (
                                      <div className="p-3 text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-200 italic">
                                        Tidak ada petugas yang dikhususkan untuk {selectedArmadaData.nama_armada} yang sedang tersedia.
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 min-h-[60px]">
                                        {availablePetugas.map((p) => {
                                          const isSelected = unit.petugasIds.includes(p.id);
                                          return (
                                            <button
                                              type="button"
                                              key={p.id}
                                              onClick={() => {
                                                const newUnits = [...units];
                                                if (isSelected) {
                                                  newUnits[index].petugasIds = newUnits[index].petugasIds.filter(id => id !== p.id);
                                                } else {
                                                  if (newUnits[index].petugasIds.length < 3) {
                                                    newUnits[index].petugasIds.push(p.id);
                                                  } else {
                                                    toast.error("Maksimal 3 petugas per armada");
                                                  }
                                                }
                                                setUnits(newUnits);
                                                setIsAttemptedAssign(false);
                                              }}
                                              className={`px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                                                isSelected 
                                                  ? "bg-yellow-100 border-yellow-400 text-yellow-800 shadow-sm font-medium" 
                                                  : "bg-white border-gray-200 text-gray-700 hover:border-yellow-300 hover:bg-yellow-50"
                                              }`}
                                            >
                                              {p.nama}
                                              {p.status_petugas === "Bertugas" && (
                                                <span className={`text-[10px] px-1 py-0.5 rounded leading-none ${isSelected ? 'bg-yellow-200 text-yellow-900' : 'bg-gray-100 text-gray-500'}`}>Bertugas</span>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {isAttemptedAssign && unit.armadaId && unit.petugasIds.length === 0 && (
                                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium animate-in slide-in-from-top-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> Wajib memilih minimal 1 petugas
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-dashed border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50/50 mt-2 h-10 cursor-pointer"
                            onClick={() => {
                              setUnits([...units, { armadaId: "", petugasIds: [] }]);
                              setIsAttemptedAssign(false);
                            }}
                          >
                            + Tambah Unit Lain
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="catatan">Catatan untuk Semua Petugas</Label>
                          <Textarea id="catatan" placeholder="Instruksi tambahan jika ada..." className="resize-none bg-white" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                        </div>

                        <Button disabled={isSubmitting} type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer">
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} 
                          Terjunkan {units.length} Unit
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {(laporan.status === "ditugaskan" || laporan.status === "proses" || laporan.status === "selesai") && penugasanList.length > 0 && (
                  <Card className="shadow-sm border-orange-100 bg-orange-50/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Info Penugasan</h3>
                      <div className="space-y-4">
                        {penugasanList.map((unit, idx) => {
                          const pData = unit.petugas;
                          const aData = unit.armada;

                          return (
                            <div key={idx} className="p-3 bg-white rounded-lg border border-orange-100 space-y-3">
                              <div className="text-xs font-semibold text-orange-800 bg-orange-100 px-2 py-1 rounded inline-block">Unit {idx + 1}</div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-2">
                                  <Truck className="text-orange-600 w-4 h-4 mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-medium text-sm">{aData?.nama_armada || "Armada"}</div>
                                    <div className="text-xs text-gray-500 capitalize">
                                      {aData?.jenis} • {aData?.nopol}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <HardHat className="text-orange-600 w-4 h-4 mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-medium text-sm">{pData?.nama || "Petugas"}</div>
                                    <div className="text-xs text-gray-500">{pData?.no_hp}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="pt-2 border-t border-orange-100">
                          <Label className="text-gray-500 text-xs">Catatan Dispatcher</Label>
                          <p className="text-sm font-medium">{penugasanList[0]?.catatan_admin || "-"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {laporan.status === "selesai" && (
                  <Card className="shadow-sm border-green-100 bg-green-50/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600 w-5 h-5" /> Laporan Selesai
                      </h3>
                      <div className="space-y-4">
                        {penugasanList.filter(p => p.status === 'selesai').map((penugasan, idx) => (
                          <div key={idx} className="space-y-4 pb-4 border-b border-green-200 last:border-0 last:pb-0">
                            {penugasanList.filter(p => p.status === 'selesai').length > 1 && (
                              <h4 className="text-sm font-bold text-green-800">Dari Petugas: {penugasan.petugas?.nama || "Petugas"}</h4>
                            )}
                            <div>
                              <Label className="text-gray-500">Catatan Penutup Petugas</Label>
                              <p className="mt-1 font-medium">{penugasan.catatan_penutup || "Tidak ada catatan"}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500 flex items-center gap-1.5 mb-2">
                                <ImageIcon className="w-4 h-4" /> Foto Bukti Selesai
                              </Label>
                              {penugasan.foto_bukti_url ? (
                                <Dialog>
                                  <DialogTrigger className="w-full sm:w-64 h-40 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-green-500 transition-all p-0 bg-gray-100 focus:outline-none flex items-center justify-center">
                                    <img src={penugasan.foto_bukti_url} alt="Foto Bukti Selesai" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-5xl w-[95vw] bg-transparent border-none shadow-none ring-0 p-0" showCloseButton={false}>
                                    <DialogTitle className="sr-only">Preview Foto Bukti</DialogTitle>
                                    <DialogClose className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex items-center gap-2 px-5 py-2.5 bg-gray-900/90 hover:bg-gray-950 text-white backdrop-blur-md rounded-full border border-gray-700 transition-all shadow-2xl focus:outline-none group cursor-pointer">
                                      <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                      <span className="text-sm font-semibold tracking-wide pr-1">Tutup Preview</span>
                                    </DialogClose>
                                    <div className="relative w-full h-[90vh] flex items-center justify-center">
                                      <img src={penugasan.foto_bukti_url} alt="Preview Foto Bukti" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/20" />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                  <span className="text-sm text-gray-400">Belum ada foto yang diunggah.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {penugasanList.filter(p => p.status === 'selesai').length === 0 && (
                          <div className="text-sm text-gray-500 italic">Belum ada data penyelesaian dari petugas.</div>
                        )}
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
                        <strong>Alasan:</strong> {laporan.alasan_tolak || "-"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>

      <ConfirmDialog
        open={isVerifying}
        onOpenChange={setIsVerifying}
        title="Verifikasi Laporan?"
        description={`Anda yakin laporan dari ${laporan?.pelapor_nama} ini valid dan bukan panggilan palsu?`}
        onConfirm={handleVerify}
        confirmText="Ya, Verifikasi"
      />

      <ConfirmDialog
        open={isRejecting}
        onOpenChange={setIsRejecting}
        title="Tolak Laporan"
        description=""
        onConfirm={handleReject}
        confirmText="Tolak Laporan"
        variant="destructive"
      >
        <div className="space-y-4 mt-4 text-left">
          <p className="text-sm text-gray-500">Masukkan alasan spesifik mengapa laporan ditolak (misal: panggilan palsu, duplikat).</p>
          <Textarea placeholder="Alasan penolakan..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="resize-none" />
        </div>
      </ConfirmDialog>
    </Sheet>
  );
}
