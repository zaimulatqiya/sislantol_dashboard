import { Armada } from '../types';

export const mockArmada: Armada[] = [
  // Derek Besar (2)
  { id: 'a1', nama: 'Derek Besar 01', jenis: 'derek', nopol: 'L 8001 AA', status: 'Tersedia', pos: 'Satelit' },
  { id: 'a2', nama: 'Derek Besar 02', jenis: 'derek', nopol: 'L 8002 AA', status: 'Tersedia', pos: 'Waru A' },
  
  // Derek Kecil (3)
  { id: 'a3', nama: 'Derek Kecil 01', jenis: 'derek', nopol: 'L 8101 AB', status: 'Tersedia', pos: 'Satelit' },
  { id: 'a4', nama: 'Derek Kecil 02', jenis: 'derek', nopol: 'L 8102 AB', status: 'Digunakan', pos: 'Waru A' },
  { id: 'a5', nama: 'Derek Kecil 03', jenis: 'derek', nopol: 'L 8103 AB', status: 'Tersedia', pos: 'Waru B' },

  // Patroli (3)
  { id: 'a6', nama: 'Patroli 01', jenis: 'patroli', nopol: 'W 1122 CC', status: 'Tersedia', pos: 'Pos 1 Waru' },
  { id: 'a7', nama: 'Patroli 02', jenis: 'patroli', nopol: 'W 1123 CC', status: 'Digunakan', pos: 'Pos 2 Sidoarjo' },
  { id: 'a8', nama: 'Patroli 03', jenis: 'patroli', nopol: 'W 1124 CC', status: 'Tersedia', pos: 'Pos 3 Porong' },

  // Towing (3)
  { id: 'a9', nama: 'Towing 01', jenis: 'towing', nopol: 'L 9001 DD', status: 'Tersedia', pos: 'Satelit' },
  { id: 'a10', nama: 'Towing 02', jenis: 'towing', nopol: 'L 9002 DD', status: 'Tersedia', pos: 'Waru A' },
  { id: 'a11', nama: 'Towing 03', jenis: 'towing', nopol: 'L 9003 DD', status: 'Tersedia', pos: 'Waru B' },

  // Mobil Ambulan (3)
  { id: 'a12', nama: 'Ambulan 01', jenis: 'ambulan', nopol: 'W 7701 EE', status: 'Tersedia', pos: 'Porong' },
  { id: 'a13', nama: 'Ambulan 02', jenis: 'ambulan', nopol: 'W 7702 EE', status: 'Tersedia', pos: 'Waru A' },
  { id: 'a14', nama: 'Ambulan 03', jenis: 'ambulan', nopol: 'W 7703 EE', status: 'Digunakan', pos: 'Pos 4 Gempol' },
];
