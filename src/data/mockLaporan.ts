import { Laporan } from '../types';

export const BASE_TIME = new Date('2026-04-17T10:00:00Z').getTime();

export const mockLaporan: Laporan[] = [
  {
    id: 'LAP-001',
    pelaporNama: 'Siti Rahma',
    pelaporNoHp: '08199998888',
    jenisKejadian: 'mogok',
    lokasi: 'KM 14+200 A (Sby-Gempol)',
    deskripsi: 'Mobil mogok di bahu jalan, mesin tiba-tiba mati tidak bisa distarter lagi.',
    fotoKejadianUrls: [
      'https://images.unsplash.com/photo-1563728923-38dd0a3d4f13?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop'
    ],
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
    fotoKejadianUrls: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505628346881-b72b27e84530?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=800&auto=format&fit=crop'
    ],
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
  },
  {
    id: 'LAP-011',
    pelaporNama: 'Budi Santoso',
    pelaporNoHp: '081234567890',
    jenisKejadian: 'kecelakaan',
    lokasi: 'KM 25+400 A',
    deskripsi: 'Mobil terserempet truk dan butuh bantuan segera.',
    status: 'menunggu',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 2).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 2).toISOString(),
    riwayat: [{ status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 2).toISOString() }]
  },
  {
    id: 'LAP-012',
    pelaporNama: 'Sari Ayu',
    pelaporNoHp: '085678901234',
    jenisKejadian: 'mogok',
    lokasi: 'KM 14+800 B',
    deskripsi: 'Ban kempes, butuh bantuan untuk ganti ban serep.',
    status: 'diverifikasi',
    createdAt: new Date(BASE_TIME - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(BASE_TIME - 1000 * 60 * 10).toISOString(),
    riwayat: [
      { status: 'menunggu', waktu: new Date(BASE_TIME - 1000 * 60 * 30).toISOString() },
      { status: 'diverifikasi', waktu: new Date(BASE_TIME - 1000 * 60 * 10).toISOString(), keterangan: 'Telah dikonfirmasi via telepon, lokasi valid.' }
    ]
  }
];
