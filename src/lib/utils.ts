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

export function formatDuration(start: string | undefined | null, end: string | undefined | null): string {
  if (!start || !end) return '-';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  
  if (diffMs < 0 || isNaN(diffMs)) return '-';
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins} menit`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
  }
}
