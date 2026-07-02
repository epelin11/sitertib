-- =========================================================
--  SI TERTIB — Skema Database
--  Sistem Informasi Tertib Keluar Masuk Kelas
-- =========================================================

CREATE DATABASE IF NOT EXISTS sitertib_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sitertib_db;

-- ---------------------------------------------------------
-- Tabel: guru
-- Akun guru/staf yang berhak login untuk melihat Data Siswa
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS guru (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,        -- disimpan dalam bentuk hash bcrypt
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabel: siswa
-- Data master siswa
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS siswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nisn VARCHAR(20) NOT NULL UNIQUE,
  jenis_kelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
  kelas VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabel: izin_keluar
-- Catatan setiap kali siswa keluar & masuk kelas
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS izin_keluar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  siswa_id INT NOT NULL,
  nama_siswa VARCHAR(100) NOT NULL,
  nisn VARCHAR(20) NOT NULL,
  kelas VARCHAR(20) NOT NULL,
  alasan VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  waktu_keluar DATETIME NOT NULL,
  waktu_masuk DATETIME DEFAULT NULL,     -- NULL = siswa belum kembali ke kelas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_izin_siswa FOREIGN KEY (siswa_id) REFERENCES siswa(id)
    ON DELETE CASCADE,
  INDEX idx_nisn_tanggal (nisn, tanggal)
) ENGINE=InnoDB;

-- =========================================================
-- Catatan: data contoh (guru & siswa demo) dibuat lewat
-- script `database/seed.js`, bukan lewat file SQL ini,
-- karena password guru perlu di-hash dengan bcrypt terlebih
-- dahulu. Jalankan: npm run seed
-- =========================================================
