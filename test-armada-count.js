const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: armada, error } = await supabase.from('armada').select('id');
  if (error) console.error(error);
  
  const { data: profiles, error: err2 } = await supabase.from('profiles').select('id, role').eq('role', 'petugas');
  if (err2) console.error(err2);

  console.log(`Jumlah Armada: ${armada.length}`);
  console.log(`Jumlah Petugas: ${profiles.length}`);
  
  const dibutuhkan = armada.length * 3;
  console.log(`Total Petugas Dibutuhkan (3 per armada): ${dibutuhkan}`);
  console.log(`Kekurangan Petugas: ${dibutuhkan - profiles.length}`);
}
main();
