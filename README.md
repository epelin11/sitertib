# SI TERTIB — Sistem Informasi Tertib Keluar Masuk Kelas

Website untuk mencatat dan memantau siswa yang keluar-masuk kelas, dengan
rekap persentase per siswa khusus untuk guru/staf yang sudah login.

**Stack:** React (Vite) + Tailwind CSS · Express.js · MySQL

```
sitertib/
├── backend/      → API Express + MySQL
└── frontend/     → React + Vite + Tailwind
```

---

## ✨ Fitur

- **Beranda** — perkenalan sistem + tombol "Isi Identitas" & "Login Guru".
- **Tentang** — penjelasan apa itu SI TERTIB (silakan disunting isinya).
- **Isi Identitas** (publik, tanpa login) — siswa mencatat *keluar kelas*
  (nama, NISN, jenis kelamin, kelas, alasan) dan *kembali masuk* (NISN).
  Waktu keluar/masuk dicatat otomatis oleh server.
- **Login Guru** — login & pendaftaran akun guru (JWT).
- **Data Siswa** (dilindungi login) — kartu ringkasan persentase + tabel
  siswa (nama, NISN, jenis kelamin, kelas, persentase keluar kelas hari ini),
  lengkap dengan pencarian & filter kelas.

---

## 🗄️ 1. Siapkan Database MySQL

1. Pastikan MySQL server sudah berjalan di komputer/server anda.
2. Import skema database:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
   Perintah ini akan membuat database `sitertib_db` beserta tabel
   `guru`, `siswa`, dan `izin_keluar`.

---

## ⚙️ 2. Jalankan Backend (Express + MySQL)

```bash
cd backend
npm install
cp .env.example .env
```

Buka file `.env` dan sesuaikan dengan konfigurasi MySQL anda
(`DB_USER`, `DB_PASSWORD`, `DB_NAME`, dst), lalu jalankan:

```bash
# Isi data contoh (1 akun guru demo + siswa + catatan demo)
npm run seed

# Jalankan server (mode pengembangan, auto-restart)
npm run dev
# atau mode biasa: npm start
```

Backend berjalan di **http://localhost:5000**.

**Akun guru demo** (dibuat oleh `npm run seed`):
- Email: `guru@sitertib.sch.id`
- Password: `admin123`

> ⚠️ Setelah seeding, segera buat akun guru sungguhan lewat halaman
> "Daftar Akun" dan hapus/ubah akun demo ini di tabel `guru` sebelum
> dipakai secara nyata di sekolah.

### Daftar Endpoint API

| Method | Endpoint              | Akses   | Keterangan                          |
|--------|------------------------|---------|--------------------------------------|
| POST   | `/api/auth/login`      | Publik  | Login guru, mengembalikan token JWT |
| POST   | `/api/auth/register`   | Publik  | Daftar akun guru baru               |
| GET    | `/api/auth/me`         | Token   | Data guru yang sedang login         |
| POST   | `/api/izin/keluar`     | Publik  | Catat siswa keluar kelas            |
| PUT    | `/api/izin/masuk`      | Publik  | Catat siswa kembali masuk kelas     |
| GET    | `/api/siswa`           | Token   | Daftar siswa + persentase keluar    |

---

## 💻 3. Jalankan Frontend (React + Vite + Tailwind)

Buka terminal baru:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend berjalan di **http://localhost:5173** dan otomatis terhubung
ke backend lewat `VITE_API_URL` (lihat file `.env`).

---

## 📊 Tentang Perhitungan Persentase

Persentase pada halaman **Data Siswa** dihitung dengan rumus:

```
persentase = (jumlah keluar kelas hari ini ÷ MAX_KELUAR_PER_HARI) × 100%
```

`MAX_KELUAR_PER_HARI` adalah asumsi jumlah maksimum siswa "boleh" keluar
kelas dalam sehari yang masih dianggap wajar (default: **6**, sesuaikan
di file `backend/.env`). Semakin sering siswa keluar kelas melebihi
batas ini, persentasenya akan mencapai 100%.

---

## 🛠️ Mengubah Tampilan

- Warna, font, dan gaya komponen diatur lewat Tailwind di
  `frontend/tailwind.config.js` dan `frontend/src/index.css`.
- Isi halaman **Tentang** ada di `frontend/src/pages/Tentang.jsx` —
  silakan ubah teksnya sesuai kebutuhan sekolah anda.
- Pilihan kelas & alasan keluar pada formulir "Isi Identitas" ada di
  bagian atas file `frontend/src/pages/IsiIdentitas.jsx` (`KELAS_OPSI`
  dan `ALASAN_OPSI`).

---

## 🚀 Deploy ke Produksi (ringkas)

- **Backend:** deploy ke VPS/hosting Node.js (mis. VPS, Railway, Render),
  gunakan MySQL terkelola (mis. PlanetScale/Amazon RDS/cPanel MySQL),
  set `JWT_SECRET` yang kuat & acak, set `FRONTEND_URL` ke domain asli.
- **Frontend:** `npm run build` di folder `frontend`, lalu unggah hasil
  folder `dist/` ke hosting statis (mis. Netlify, Vercel, atau cPanel),
  set `VITE_API_URL` ke URL backend produksi sebelum build.
