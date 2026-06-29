const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // 1. Ambil jenis armada yang ada
  const { data: armada } = await supabase.from('armada').select('jenis');
  const types = [...new Set(armada.map(d => d.jenis))];
  
  // 2. Ambil semua petugas
  const { data: profiles, error } = await supabase.from('profiles').select('id, nama').eq('role', 'petugas');
  
  if (error || !profiles) {
    console.error("Gagal mengambil data petugas:", error);
    return;
  }
  
  console.log(`Ditemukan ${profiles.length} petugas. Memulai distribusi otomatis...`);
  
  // 3. Distribusikan secara acak/merata
  let successCount = 0;
  for (let i = 0; i < profiles.length; i++) {
    const petugas = profiles[i];
    const assignedType = types[i % types.length]; // Distribusi merata bergiliran
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ jenis_armada: assignedType })
      .eq('id', petugas.id);
      
    if (updateError) {
      console.error(`Gagal update petugas ${petugas.nama}:`, updateError.message);
    } else {
      console.log(`[OK] ${petugas.nama} -> ${assignedType}`);
      successCount++;
    }
  }
  
  console.log(`\nSelesai! ${successCount} petugas berhasil diupdate spesialisasi armadanya.`);
}

main();
