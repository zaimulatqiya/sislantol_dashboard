import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Gunakan Service Role Key untuk bypass RLS (karena ini dijalankan di server)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email, password, nama, noHp, pos } = await req.json();

    // 1. Buat User di sistem Auth Supabase
    // Trigger 'handle_new_user' akan otomatis memasukkan data ke tabel 'profiles'
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Langsung aktif tanpa perlu verifikasi email
      user_metadata: {
        nama: nama,
        no_hp: noHp,
        role: 'petugas',
        pos: pos
      }
    });

    if (error) throw error;

    // Pastikan status diset ke Tersedia secara eksplisit di tabel profiles
    if (data.user) {
      await supabaseAdmin.from('profiles').update({
        status_petugas: 'Tersedia',
        is_active: true
      }).eq('id', data.user.id);
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) throw new Error('ID Petugas diperlukan');

    // Hapus dari sistem Auth
    // Karena tabel profiles menggunakan ON DELETE CASCADE, data di profiles juga otomatis terhapus
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
