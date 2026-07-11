# 🖥️ Sislantol Dashboard

Dashboard admin berbasis **Next.js** untuk sistem pengelolaan lalu lintas online (Sislantol).

---

## ⚙️ Versi yang Harus Diinstall (Wajib Sama!)

| Software | Versi | Link Download |
|---|---|---|
| **Node.js** | `v24.12.0` | https://nodejs.org/en/download/releases |
| **npm** | `11.7.0` *(otomatis dengan Node.js)* | - |
| **Git** | `2.52.0` atau lebih baru | https://git-scm.com/downloads |

> ⚠️ **PENTING**: Gunakan **Node.js v24.12.0** agar tidak ada masalah kompatibilitas.

---

## 🚀 Cara Setup Project (Pertama Kali)

### 1. Clone Repository
```bash
git clone https://github.com/zaimulatqiya/sislantol_dashboard.git
cd sislantol_dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Buat File `.env`
Buat file `.env` di root folder, isi dengan:
```env
NEXT_PUBLIC_SUPABASE_URL=isi_dari_pemilik_project
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=isi_dari_pemilik_project
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_dari_pemilik_project
SUPABASE_SERVICE_ROLE_KEY=isi_dari_pemilik_project
```
> 📩 Minta file `.env` langsung ke pemilik project secara private (jangan share di chat publik).

### 4. Jalankan Project
```bash
npm run dev
```
Buka browser → http://localhost:3000

---

## 📦 Versi Dependency Utama

| Package | Versi |
|---|---|
| Next.js | `16.2.4` |
| React | `19.2.4` |
| TypeScript | `^5` |
| Tailwind CSS | `^4` |
| Supabase JS | `^2.106.2` |

---

## 🛠️ Cek Versi Node.js di Komputer

Buka terminal/PowerShell, ketik:
```bash
node --version
# Harus tampil: v24.12.0

npm --version
# Harus tampil: 11.7.0
```

Jika versi berbeda, download Node.js v24.12.0 dari:
👉 https://nodejs.org/en/download/releases
