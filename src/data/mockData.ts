import { Admin, Armada, Laporan, Petugas, Penugasan } from '@/types';

const BASE_TIME = new Date('2026-04-17T10:00:00Z').getTime();

export const mockAdmin: Admin = {
  id: 'admin-1',
  nama: 'Admin Sislantol',
  email: 'admin@sislantol.com',
  noHp: '081234567890',
  role: 'admin',
};

export const mockPetugas: Petugas[] = [
  { id: 'p1', nama: 'Budi Santoso', email: 'budi@sislantol.com', noHp: '08111111111', status: 'Tersedia', tugasSelesai: 45 },
  { id: 'p2', nama: 'Agus Subagyo', email: 'agus@sislantol.com', noHp: '08222222222', status: 'Bertugas', tugasSelesai: 32 },
  { id: 'p3', nama: 'Candra Wijaya', email: 'candra@sislantol.com', noHp: '08333333333', status: 'Tersedia', tugasSelesai: 12 },
  { id: 'p4', nama: 'Dedi Kurniawan', email: 'dedi@sislantol.com', noHp: '08444444444', status: 'Bertugas', tugasSelesai: 50 },
  { id: 'p5', nama: 'Eko Prasetyo', email: 'eko@sislantol.com', noHp: '08555555555', status: 'Tersedia', tugasSelesai: 8 },
];

export const mockArmada: Armada[] = [
  // Derek Besar (2)
  { id: 'a1', nama: 'Derek Besar 01', jenis: 'derek', nopol: 'L 8001 AA', status: 'Tersedia', pos: 'Pos 1 Waru' },
  { id: 'a2', nama: 'Derek Besar 02', jenis: 'derek', nopol: 'L 8002 AA', status: 'Tersedia', pos: 'Pos 2 Sidoarjo' },
  
  // Derek Kecil (3)
  { id: 'a3', nama: 'Derek Kecil 01', jenis: 'derek', nopol: 'L 8101 AB', status: 'Tersedia', pos: 'Pos 3 Porong' },
  { id: 'a4', nama: 'Derek Kecil 02', jenis: 'derek', nopol: 'L 8102 AB', status: 'Digunakan', pos: 'Pos 4 Gempol' },
  { id: 'a5', nama: 'Derek Kecil 03', jenis: 'derek', nopol: 'L 8103 AB', status: 'Tersedia', pos: 'Pos 1 Waru' },

  // Patroli (3)
  { id: 'a6', nama: 'Patroli 01', jenis: 'patroli', nopol: 'W 1122 CC', status: 'Tersedia', pos: 'Pos 1 Waru' },
  { id: 'a7', nama: 'Patroli 02', jenis: 'patroli', nopol: 'W 1123 CC', status: 'Digunakan', pos: 'Pos 2 Sidoarjo' },
  { id: 'a8', nama: 'Patroli 03', jenis: 'patroli', nopol: 'W 1124 CC', status: 'Tersedia', pos: 'Pos 3 Porong' },

  // Towing (3)
  { id: 'a9', nama: 'Towing 01', jenis: 'towing', nopol: 'L 9001 DD', status: 'Tersedia', pos: 'Pos 1 Waru' },
  { id: 'a10', nama: 'Towing 02', jenis: 'towing', nopol: 'L 9002 DD', status: 'Tersedia', pos: 'Pos 3 Porong' },
  { id: 'a11', nama: 'Towing 03', jenis: 'towing', nopol: 'L 9003 DD', status: 'Tersedia', pos: 'Pos 4 Gempol' },

  // Mobil Ambulan (3)
  { id: 'a12', nama: 'Ambulan 01', jenis: 'ambulan', nopol: 'W 7701 EE', status: 'Tersedia', pos: 'Pos 1 Waru' },
  { id: 'a13', nama: 'Ambulan 02', jenis: 'ambulan', nopol: 'W 7702 EE', status: 'Tersedia', pos: 'Pos 2 Sidoarjo' },
  { id: 'a14', nama: 'Ambulan 03', jenis: 'ambulan', nopol: 'W 7703 EE', status: 'Digunakan', pos: 'Pos 4 Gempol' },
];

export const mockLaporan: Laporan[] = [
  {
    id: 'LAP-001',
    pelaporNama: 'Siti Rahma',
    pelaporNoHp: '08199998888',
    jenisKejadian: 'mogok',
    lokasi: 'KM 14+200 A (Sby-Gempol)',
    deskripsi: 'Mobil mogok di bahu jalan, mesin tiba-tiba mati tidak bisa distarter lagi.',
    status: 'menunggu',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 15).toISOString(), // 15 mins ago
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 15).toISOString(),
    riwayat: [{ status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 15).toISOString() }]
  },
  {
    id: 'LAP-002',
    pelaporNama: 'Joko Anwar',
    pelaporNoHp: '08177776666',
    jenisKejadian: 'kecelakaan',
    lokasi: 'KM 20+500 B (Gempol-Sby)',
    deskripsi: 'Kecelakaan beruntun melibatkan 2 mobil dan 1 truk. Arus lalu lintas tersendat.',
    status: 'diverifikasi',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 30).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 60).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 30).toISOString(), keterangan: 'Telah ditelepon, valid.' }
    ]
  },
  {
    id: 'LAP-003',
    pelaporNama: 'Hendra',
    pelaporNoHp: '08122334455',
    jenisKejadian: 'hambatan',
    lokasi: 'Gerbang Tol Sidoarjo',
    deskripsi: 'Ada benda jatuh (ban bekas) di tengah jalan raya sebelum gate.',
    status: 'ditugaskan',
    petugasId: 'p2',
    armadaId: 'a2',
    catatanPenugasan: 'Segera pinggirkan ban dan amankan jalur',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 45).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 120).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 100).toISOString() },
      { status: 'ditugaskan', waktu: new Date(BASE_TIME - 1000 * 60 * 45).toISOString(), keterangan: 'Petugas Agus dikerahkan.' }
    ]
  },
  {
    id: 'LAP-004',
    pelaporNama: 'Rina',
    pelaporNoHp: '085566778899',
    jenisKejadian: 'mogok',
    lokasi: 'KM 30+100 A',
    deskripsi: 'Ban bocor dan tidak ada dongkrak.',
    status: 'proses',
    petugasId: 'p4',
    armadaId: 'a4',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 20).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 180).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 160).toISOString() },
      { status: 'ditugaskan', waktu: new Date(BASE_TIME - 1000 * 60 * 120).toISOString() },
      { status: 'proses', waktu: new Date(BASE_TIME - 1000 * 60 * 20).toISOString(), keterangan: 'Petugas tiba di lokasi dan mulai penanganan.' }
    ]
  },
  {
    id: 'LAP-005',
    pelaporNama: 'Ahmad Fauzi',
    pelaporNoHp: '081345678901',
    jenisKejadian: 'kecelakaan',
    lokasi: 'KM 10+000 B',
    deskripsi: 'Mobil menabrak pembatas jalan.',
    status: 'selesai',
    petugasId: 'p1',
    armadaId: 'a1',
    catatanPenutup: 'Korban luka ringan, mobil sudah diderek ke exit tol terdekat.',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 60 * 20).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 24).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 23.5).toISOString() },
      { status: 'ditugaskan', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 23).toISOString() },
      { status: 'proses', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 22).toISOString() },
      { status: 'selesai', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 20).toISOString() }
    ]
  },
  {
    id: 'LAP-006',
    pelaporNama: 'Ismail',
    pelaporNoHp: '085544332211',
    jenisKejadian: 'lainnya',
    lokasi: 'KM 15+000',
    deskripsi: 'Iseng telpon',
    status: 'ditolak',
    alasanDitolak: 'Laporan palsu / prank call.',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 60 * 47).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 48).toISOString() },
      { status: 'ditolak', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 47).toISOString(), keterangan: 'Ditolak: Laporan palsu / prank call.' }
    ]
  },
  {
    id: 'LAP-007',
    pelaporNama: 'Maria',
    pelaporNoHp: '081223344556',
    jenisKejadian: 'mogok',
    lokasi: 'KM 12+100 A',
    deskripsi: 'Overheat',
    status: 'menunggu',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 5).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 5).toISOString(),
    riwayat: [{ status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 5).toISOString() }]
  },
  {
    id: 'LAP-008',
    pelaporNama: 'Toni',
    pelaporNoHp: '081223344556',
    jenisKejadian: 'hambatan',
    lokasi: 'KM 18+200 B',
    deskripsi: 'Ada genangan air tinggi',
    status: 'diverifikasi',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 80).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 70).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 80).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 70).toISOString() }
    ]
  },
  {
    id: 'LAP-009',
    pelaporNama: 'Dion',
    pelaporNoHp: '088812341234',
    jenisKejadian: 'kecelakaan',
    lokasi: 'Gerbang Tol Waru',
    deskripsi: 'Truk menabrak gerbang tol.',
    status: 'proses',
    petugasId: 'p2',
    armadaId: 'a2',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 30).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 180).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 170).toISOString() },
      { status: 'ditugaskan', waktu: new Date(BASE_TIME - 1000 * 60 * 160).toISOString() },
      { status: 'proses', waktu: new Date(BASE_TIME - 1000 * 60 * 30).toISOString() }
    ]
  },
  {
    id: 'LAP-010',
    pelaporNama: 'Sinta',
    pelaporNoHp: '089911223344',
    jenisKejadian: 'mogok',
    lokasi: 'KM 22+000 A',
    deskripsi: 'Kopling jebol.',
    status: 'selesai',
    petugasId: 'p1',
    armadaId: 'a1',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 60 * 45).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 48).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 47).toISOString() },
      { status: 'ditugaskan', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 46.5).toISOString() },
      { status: 'proses', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 46).toISOString() },
      { status: 'selesai', waktu: new Date(BASE_TIME - 1000 * 60 * 60 * 45).toISOString() }
    ]
  }
];

export const mockPenugasan: Penugasan[] = [
  { id: 'TUG-001', laporanId: 'LAP-003', petugasId: 'p2', armadaId: 'a2', waktuDitugaskan: new Date(BASE_TIME - 1000 * 60 * 45).toISOString(), status: 'aktif' },
  { id: 'TUG-002', laporanId: 'LAP-004', petugasId: 'p4', armadaId: 'a4', waktuDitugaskan: new Date(BASE_TIME - 1000 * 60 * 120).toISOString(), status: 'aktif' },
  { id: 'TUG-003', laporanId: 'LAP-009', petugasId: 'p2', armadaId: 'a2', waktuDitugaskan: new Date(BASE_TIME - 1000 * 60 * 160).toISOString(), status: 'aktif' }, // p2 handles 2 concurrently
];
