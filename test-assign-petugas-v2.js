const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // 1. Ambil semua armada
  const { data: armadaData } = await supabase.from('armada').select('id, nama_armada');
  if (!armadaData || armadaData.length === 0) {
    console.error("Tidak ada data armada.");
    return;
  }
  
  // 2. Ambil semua petugas
  const { data: profiles, error } = await supabase.from('profiles').select('id, nama').eq('role', 'petugas');
  if (error || !profiles) {
    console.error("Gagal mengambil data petugas:", error);
    return;
  }
  
  console.log(`Ditemukan ${profiles.length} petugas dan ${armadaData.length} armada. Memulai distribusi otomatis...`);
  
  // 3. Distribusikan secara acak/merata
  let successCount = 0;
  for (let i = 0; i < profiles.length; i++) {
    const petugas = profiles[i];
    const assignedArmada = armadaData[i % armadaData.length]; // Distribusi merata bergiliran
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ armada_id: assignedArmada.id })
      .eq('id', petugas.id);
      
    if (updateError) {
      console.error(`Gagal update petugas ${petugas.nama}:`, updateError.message);
    } else {
      console.log(`[OK] ${petugas.nama} -> ${assignedArmada.nama_armada}`);
      successCount++;
    }
  }
  
  console.log(`\nSelesai! ${successCount} petugas berhasil diupdate armada_id-nya.`);
}

main();
