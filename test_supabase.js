require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log("=== Menguji Koneksi Supabase ===");
  try {
    // 1. Fetch
    console.log("1. Mencoba FETCH data...");
    const { data: fetch, error: fetchErr } = await supabase.from('armada').select('id, nama_armada').limit(2);
    if (fetchErr) throw fetchErr;
    console.log("-> Berhasil Fetch:", fetch);

    // 2. Coba Hapus record sampah 'jskjakklaaa' jika ada
    console.log("2. Mencari record sampah 'jskjakklaaa'...");
    const { data: sampah, error: sampahErr } = await supabase.from('armada').select('id').eq('nama_armada', 'jskjakklaaa').limit(1);
    if (sampahErr) throw sampahErr;
    
    if (sampah && sampah.length > 0) {
      console.log(`-> Ditemukan record sampah (ID: ${sampah[0].id}), mencoba MENGHAPUS...`);
      const { error: delErr } = await supabase.from('armada').delete().eq('id', sampah[0].id);
      if (delErr) throw delErr;
      console.log("-> Berhasil menghapus record sampah!");
    } else {
      console.log("-> Tidak ada record sampah ditemukan.");
    }
    
    console.log("=== SEMUA TES BERHASIL. SUPABASE SEHAT. ===");
  } catch (err) {
    console.error("!!! SUPABASE ERROR !!!");
    console.error(err);
  }
}

testSupabase();
