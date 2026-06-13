const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qyslzpprsiprowqzjrox.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2x6cHByc2lwcm93cXpqcm94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI4MzY0NiwiZXhwIjoyMDk0ODU5NjQ2fQ.nk6HVs0Ok9dhmIYkt7E1KBa7Lw2hJFN67rfVX09BzWM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedLaporan() {
  console.log("Memasukkan 1 data laporan baru untuk testing...");
  
  const dummyLaporan = {
    pelapor_nama: "Bapak Budi",
    pelapor_no_hp: "081122334455",
    jenis_kejadian: "mogok",
    lokasi: "KM 60+100 A (Arah Bandung)",
    deskripsi: "Mobil mogok di lajur paling kanan, keluar asap dari kap mesin. Harap segera ditarik agar tidak macet.",
    foto_urls: [
      "https://images.unsplash.com/photo-1541893322-921c5bc116ea?q=80&w=2070&auto=format&fit=crop"
    ],
    status: "menunggu",
  };

  const { data, error } = await supabase
    .from('laporan')
    .insert([dummyLaporan])
    .select();
    
  if (error) {
    console.error("Gagal memasukkan laporan:", error);
    return;
  }
  
  console.log("Berhasil! Data laporan baru telah ditambahkan:", data[0].id);
}

seedLaporan();
