const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qyslzpprsiprowqzjrox.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2x6cHByc2lwcm93cXpqcm94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI4MzY0NiwiZXhwIjoyMDk0ODU5NjQ2fQ.nk6HVs0Ok9dhmIYkt7E1KBa7Lw2hJFN67rfVX09BzWM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDB() {
  console.log("Memulai perbaikan data dummy (sinkronisasi laporan dengan penugasan)...");
  
  // 1. Ambil semua penugasan
  const { data: penugasanData, error: err1 } = await supabase.from('penugasan').select('laporan_id');
  if (err1) {
    console.error("Gagal mengambil penugasan:", err1);
    return;
  }
  
  const laporanIds = penugasanData.map(p => p.laporan_id);
  console.log(`Ditemukan ${laporanIds.length} penugasan. ID Laporan:`, laporanIds);
  
  if (laporanIds.length === 0) {
    console.log("Tidak ada penugasan yang perlu disinkronkan.");
    return;
  }
  
  // 2. Update status laporan yang ID-nya ada di laporanIds menjadi 'ditugaskan'
  const { data: updateData, error: err2 } = await supabase
    .from('laporan')
    .update({ status: 'ditugaskan' })
    .in('id', laporanIds)
    .neq('status', 'ditugaskan')
    .neq('status', 'proses')
    .neq('status', 'selesai');
    
  if (err2) {
    console.error("Gagal mengupdate laporan:", err2);
    return;
  }
  
  console.log("Berhasil mensinkronkan status laporan!");
}

fixDB();
