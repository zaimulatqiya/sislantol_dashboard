const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qyslzpprsiprowqzjrox.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2x6cHByc2lwcm93cXpqcm94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI4MzY0NiwiZXhwIjoyMDk0ODU5NjQ2fQ.nk6HVs0Ok9dhmIYkt7E1KBa7Lw2hJFN67rfVX09BzWM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  const { data, error } = await supabase.from('laporan').select('id, status').eq('id', 13);
  console.log("Laporan 13:", data, error);
}

checkDB();
