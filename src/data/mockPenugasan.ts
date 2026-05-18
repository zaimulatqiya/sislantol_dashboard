import { Penugasan } from '../types';
import { BASE_TIME } from './mockLaporan';

export const mockPenugasan: Penugasan[] = [
  { id: 'TUG-001', laporanId: 'LAP-003', petugasId: 'p2', armadaId: 'a2', waktuDitugaskan: new Date(BASE_TIME - 1000 * 60 * 45).toISOString(), status: 'aktif' },
  { id: 'TUG-002', laporanId: 'LAP-004', petugasId: 'p4', armadaId: 'a4', waktuDitugaskan: new Date(BASE_TIME - 1000 * 60 * 120).toISOString(), status: 'aktif' },
  { id: 'TUG-003', laporanId: 'LAP-009', petugasId: 'p2', armadaId: 'a2', waktuDitugaskan: new Date(BASE_TIME - 1000 * 60 * 160).toISOString(), status: 'aktif' }, // p2 handles 2 concurrently
];
