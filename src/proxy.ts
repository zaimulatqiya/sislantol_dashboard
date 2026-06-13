import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Fungsi ini akan dijalankan Next.js di setiap kali ada yang buka halaman.
  // Tujuannya agar sesi user (login) tidak tiba-tiba mati/logout sendiri.
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Middleware ini akan berjalan di SEMUA halaman,
     * KECUALI file-file aset seperti gambar, css, js agar website tetap cepat.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
