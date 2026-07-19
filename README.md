# SI TERTIB — Sistem Informasi Tertib Kehadiran Siswa

Aplikasi pencatatan siswa yang izin keluar-masuk kelas. Terdiri dari:
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Express.js + JWT Auth
- **Database**: MySQL

## Struktur Folder

```
sitertib/
├── backend/          # API Express + MySQL
│   ├── config/db.js
│   ├── routes/
│   ├── middleware/
│   ├── schema.sql    # Skema database
│   ├── server.js
│   └── .env.example
└── frontend/         # React + Tailwind
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/
    │   └── api/
    └── public/assets/logo-sekolah.png
```

## 1. Menyiapkan Database MySQL

1. Buka MySQL (via terminal, phpMyAdmin, atau MySQL Workbench).
2. Jalankan isi file `backend/schema.sql`:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
   Perintah ini akan membuat database `sitertib_db` beserta tabel `guru`, `siswa`, dan `riwayat_keluar_masuk`, lengkap dengan beberapa data contoh siswa.

## 2. Menjalankan Backend (Express)

```bash
cd backend
npm install
cp .env.example .env
# Buka .env lalu sesuaikan DB_USER, DB_PASSWORD, JWT_SECRET, dll.
npm run dev
```

Server berjalan di `http://localhost:5000`. Endpoint utama:

| Method | Endpoint                     | Akses    | Keterangan                                   |
|--------|-------------------------------|----------|-----------------------------------------------|
| POST   | `/api/auth/register`          | Publik   | Daftar akun guru baru                         |
| POST   | `/api/auth/login`             | Publik   | Login guru, mengembalikan JWT                 |
| POST   | `/api/riwayat`                | Publik   | Form "Isi Identitas" — catat keluar/masuk     |
| PATCH  | `/api/riwayat/:id/masuk`      | Publik   | Tandai siswa sudah kembali masuk kelas (by id)|
| PUT    | `/api/riwayat/masuk-otomatis` | **Guru** | Catat masuk otomatis berdasarkan NISN (dipakai halaman Scan Identitas) |
| GET    | `/api/riwayat/statistik-mingguan` | **Guru** | Presentasi jumlah pengisian data per hari (minggu berjalan) + tren beberapa minggu |
| GET    | `/api/siswa`                  | Guru     | Daftar siswa + jumlah keluar & persentase     |
| GET    | `/api/siswa/stats`            | Guru     | Ringkasan statistik dashboard                 |
| GET    | `/api/siswa/cari?nisn=...`    | Publik   | Cari data siswa berdasarkan NISN              |
| GET    | `/api/riwayat`                | Guru     | Riwayat lengkap (filter tanggal/kelas/cari)   |

Karena akun guru dibuat lewat halaman **Login → Daftar di sini** (memanggil `/api/auth/register`), Anda tidak perlu membuat akun manual di database — cukup daftar lewat form di frontend.

> **Catatan keamanan (opsional, disarankan):** daripada memakai user `root` MySQL langsung di `.env`, buat user khusus aplikasi, misalnya:
> ```sql
> CREATE USER 'sitertib_app'@'%' IDENTIFIED BY 'password_anda';
> GRANT ALL PRIVILEGES ON sitertib_db.* TO 'sitertib_app'@'%';
> FLUSH PRIVILEGES;
> ```
> lalu isi `DB_USER` dan `DB_PASSWORD` di `.env` sesuai user tersebut.

## 3. Menjalankan Frontend (React + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173` dan otomatis memanggil API di `http://localhost:5000/api`.
Jika backend berjalan di alamat lain, buat file `frontend/.env` berisi:
```
VITE_API_URL=http://alamat-backend-anda/api
```

## 4. Alur Penggunaan

1. **Beranda** — halaman utama dengan tombol ke "Isi Identitas" dan "Login Guru".
2. **Tentang** — penjelasan tentang SI TERTIB (isi kontennya sendiri di `frontend/src/pages/Tentang.jsx`, cari komentar `EDIT DI SINI`).
3. **Isi Identitas** — form terbuka untuk siapa saja mencatat siswa keluar/masuk kelas (nama, NISN, jenis kelamin, kelas, waktu keluar, waktu masuk, alasan).
4. **Login Guru** — guru login (atau daftar akun baru) untuk membuka menu **Data Siswa** dan **Riwayat**.
5. **Data Siswa** *(khusus guru login)* — kartu ringkasan + tabel siswa berisi nama, NISN, jenis kelamin, kelas, dan persentase seberapa sering siswa tersebut keluar kelas hari ini.
6. **Riwayat** *(khusus guru login)* — daftar seluruh catatan keluar-masuk dari berbagai pengguna, bisa difilter per tanggal, kelas, atau dicari berdasarkan nama/NISN. Di bagian atas halaman ini juga ada **presentasi mingguan**: grafik batang jumlah pengisian data per hari (Senin–Minggu) pada minggu berjalan, persentase perubahan dibanding minggu lalu, dan tren beberapa minggu terakhir.
7. **Scan Identitas** *(khusus guru login)* — guru dapat men-scan barcode/QR pada kartu siswa (via kamera, memakai `BarcodeDetector` API bawaan browser Chrome/Edge) atau mengetik NISN secara manual, lalu langsung mencatat siswa **keluar kelas** atau **masuk kembali** tanpa mengisi ulang nama/kelas/jenis kelamin. Jika NISN belum terdaftar, guru diarahkan ke form Isi Identitas dengan NISN sudah terisi otomatis.

## Catatan

- Logo sekolah (Perguruan Dharma Bakti Lubuk Pakam) ditampilkan berdampingan dengan logo SI TERTIB pada navbar dan footer. File logo berada di `frontend/public/assets/logo-sekolah.png` — ganti file ini jika ingin memakai logo lain.
- Kelas dibatasi hanya pada 6 pilihan: `X-1`, `X-2`, `XI-1`, `XI-2`, `XII-1`, `XII-2`.
- Persentase pada halaman Data Siswa dihitung dari proporsi jumlah keluar siswa tersebut terhadap total kejadian keluar seluruh siswa pada hari yang sama.
- Fitur kamera di halaman **Scan Identitas** memakai `BarcodeDetector` API bawaan browser (didukung Chrome/Edge terbaru di desktop & Android). Jika browser tidak mendukungnya, guru tetap bisa memakai kolom "Input Manual / Hasil Scanner Fisik" untuk mengetik atau menempel hasil dari scanner fisik.
