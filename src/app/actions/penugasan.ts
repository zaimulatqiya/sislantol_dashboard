"use server";

import { createClient } from "@supabase/supabase-js";

// Menggunakan service_role key untuk bypass RLS (karena ini aksi admin)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function assignPenugasanAction(
  laporanId: number,
  validUnits: { armadaId: string; petugasId: string }[],
  catatan: string
) {
  try {
    // 1. Update status laporan
    const { error: errLaporan } = await supabase
      .from("laporan")
      .update({
        status: "ditugaskan",
        updated_at: new Date().toISOString(),
      })
      .eq("id", laporanId);

    if (errLaporan) throw new Error("Gagal update laporan: " + errLaporan.message);

    // 2. Insert penugasan
    const newPenugasan = validUnits.map((u) => ({
      laporan_id: laporanId,
      petugas_id: u.petugasId,
      armada_id: u.armadaId,
      catatan_admin: catatan,
      status: "aktif",
    }));

    const { error: errPenugasan } = await supabase
      .from("penugasan")
      .insert(newPenugasan);

    if (errPenugasan) throw new Error("Gagal insert penugasan: " + errPenugasan.message);

    // 3. Update Armada (menjadi Digunakan)
    for (const u of validUnits) {
      const { error: errArmada } = await supabase
        .from("armada")
        .update({ status: "Digunakan" })
        .eq("id", u.armadaId);
      
      if (errArmada) throw new Error("Gagal update armada: " + errArmada.message);
    }

    // 4. Update Petugas (menjadi Bertugas)
    for (const u of validUnits) {
      const { error: errPetugas } = await supabase
        .from("profiles")
        .update({ status_petugas: "Bertugas" })
        .eq("id", u.petugasId);

      if (errPetugas) throw new Error("Gagal update petugas: " + errPetugas.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Server Action Error Assigning:", error);
    return { success: false, error: error.message || "Terjadi kesalahan server" };
  }
}
