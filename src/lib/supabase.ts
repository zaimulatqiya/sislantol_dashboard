import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utility functions untuk men-generate struktur folder Storage sesuai rekomendasi
 */

// Menghasilkan path untuk bucket 'bukti-kejadian'
// Hasil: laporan-{laporan_id}/foto-{timestamp}.{ext}
export const getBuktiKejadianPath = (laporanId: string | number, fileExtension: string = 'jpg') => {
  const timestamp = Date.now();
  return `laporan-${laporanId}/foto-${timestamp}.${fileExtension}`;
};

// Menghasilkan path untuk bucket 'bukti-penyelesaian'
// Hasil: penugasan-{penugasan_id}/bukti-{timestamp}.{ext}
export const getBuktiPenyelesaianPath = (penugasanId: string | number, fileExtension: string = 'jpg') => {
  const timestamp = Date.now();
  return `penugasan-${penugasanId}/bukti-${timestamp}.${fileExtension}`;
};
