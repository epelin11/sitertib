-- ============================================================
-- SI TERTIB - Skema Database MySQL
-- Sistem Informasi Tertib Kehadiran & Izin Keluar Masuk Siswa
-- ============================================================

CREATE DATABASE IF NOT EXISTS sitertib_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sitertib_db;

-- ------------------------------------------------------------
-- Tabel guru: akun guru/petugas yang bisa login ke dashboard
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guru (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabel siswa: data induk siswa
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS siswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nisn VARCHAR(20) NOT NULL UNIQUE,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  kelas ENUM('X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1', 'XII-2') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabel riwayat_keluar_masuk: log setiap kali siswa izin keluar/masuk
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS riwayat_keluar_masuk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  siswa_id INT NOT NULL,
  waktu_keluar DATETIME NOT NULL,
  waktu_masuk DATETIME NULL,
  alasan VARCHAR(255) NOT NULL,
  diinput_oleh VARCHAR(100) DEFAULT 'Umum',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Data contoh (opsional) - hapus/ubah sesuai kebutuhan
-- ------------------------------------------------------------
INSERT INTO siswa (nama, nisn, jenis_kelamin, kelas) VALUES
  ('Ahmad Fauzi', '0051234567', 'L', 'X-1'),
  ('Siti Nurhaliza', '0051234568', 'P', 'X-2'),
  ('Budi Santoso', '0051234569', 'L', 'XI-1'),
  ('Dewi Lestari', '0051234570', 'P', 'XI-2'),
  ('Rian Pratama', '0051234571', 'L', 'XII-1'),
  ('Putri Ayu', '0051234572', 'P', 'XII-2')
ON DUPLICATE KEY UPDATE nama = VALUES(nama);

-- Akun guru contoh -> password: guru123
-- (hash di bawah dibuat dengan bcrypt, silakan buat akun baru lewat endpoint register jika perlu)
