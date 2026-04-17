export type StatusLaporan = 
  | 'menunggu' 
  | 'diverifikasi' 
  | 'ditugaskan' 
  | 'proses' 
  | 'selesai' 
  | 'ditolak';

export type RoleUser = 'admin' | 'petugas';
export type StatusPetugas = 'Tersedia' | 'Bertugas' | 'Tidak Aktif';
export type JenisArmada = 'derek' | 'patroli';
export type StatusArmada = 'Tersedia' | 'Digunakan' | 'Dalam Perbaikan';

export interface Admin {
  id: string;
  nama: string;
  email: string;
  noHp: string;
  role: 'admin';
}

export interface Petugas {
  id: string;
  nama: string;
  email: string;
  noHp: string;
  status: StatusPetugas;
  tugasSelesai: number;
}

export interface Armada {
  id: string;
  nama: string;
  jenis: JenisArmada;
  nopol: string;
  status: StatusArmada;
}

export interface Laporan {
  id: string;
  pelaporNama: string;
  pelaporNoHp: string;
  jenisKejadian: 'mogok' | 'kecelakaan' | 'hambatan' | 'lainnya';
  lokasi: string;
  deskripsi: string;
  status: StatusLaporan;
  createdAt: string;
  updatedAt: string;
  
  // Optional relations
  petugasId?: string;
  armadaId?: string;
  catatanPenugasan?: string;
  catatanPenutup?: string;
  fotoBuktiUrl?: string; // mock image
  alasanDitolak?: string;
  
  riwayat: StatusUpdate[];
}

export interface StatusUpdate {
  status: StatusLaporan;
  waktu: string;
  keterangan?: string;
}

export interface Penugasan {
  id: string;
  laporanId: string;
  petugasId: string;
  armadaId: string;
  waktuDitugaskan: string;
  status: 'aktif' | 'selesai';
}
