import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDisplayJenisKejadian(jenisKejadian: string, deskripsi: string): string {
  if (jenisKejadian?.toLowerCase() === 'lainnya' && deskripsi?.startsWith('Jenis Kejadian: ')) {
    const newlineIndex = deskripsi.indexOf('\n');
    if (newlineIndex !== -1) {
      return deskripsi.substring('Jenis Kejadian: '.length, newlineIndex).trim();
    } else {
      return deskripsi.substring('Jenis Kejadian: '.length).trim();
    }
  }
  return jenisKejadian || '';
}

export function getDisplayDeskripsi(jenisKejadian: string, deskripsi: string): string {
  if (jenisKejadian?.toLowerCase() === 'lainnya' && deskripsi?.startsWith('Jenis Kejadian: ')) {
    const newlineIndex = deskripsi.indexOf('\n');
    if (newlineIndex !== -1) {
      return deskripsi.substring(newlineIndex + 1).trim();
    } else {
      return '';
    }
  }
  return deskripsi || '';
}
