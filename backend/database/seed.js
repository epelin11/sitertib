/**
 * Script untuk mengisi data awal (seed):
 * - 1 akun guru demo
 * - beberapa siswa demo
 * - beberapa catatan izin keluar demo (hari ini)
 *
 * Jalankan setelah import schema.sql:
 *   npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

async function seed() {
  try {
    console.log("⏳ Mengisi data awal...");

    // 1) Akun guru demo
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool.query(
      `INSERT INTO guru (nama, email, password)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nama = nama`,
      ["Budi Santoso", "guru@sitertib.sch.id", hashedPassword]
    );
    console.log("✅ Akun guru demo dibuat -> email: guru@sitertib.sch.id | password: admin123");

    // 2) Data siswa demo
    const siswaDemo = [
      ["Ahmad Fauzi", "0051234567", "Laki-laki", "X IPA 1"],
      ["Siti Nurhaliza", "0051234568", "Perempuan", "X IPA 1"],
      ["Budi Hermawan", "0051234569", "Laki-laki", "X IPA 2"],
      ["Dewi Lestari", "0051234570", "Perempuan", "X IPA 2"],
      ["Rizky Pratama", "0051234571", "Laki-laki", "XI IPS 1"],
      ["Putri Ayu", "0051234572", "Perempuan", "XI IPS 1"],
      ["Fajar Nugraha", "0051234573", "Laki-laki", "XI IPS 2"],
      ["Indah Permata", "0051234574", "Perempuan", "XII IPA 1"],
    ];

    for (const [nama, nisn, jk, kelas] of siswaDemo) {
      await pool.query(
        `INSERT INTO siswa (nama, nisn, jenis_kelamin, kelas)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nama = nama`,
        [nama, nisn, jk, kelas]
      );
    }
    console.log(`✅ ${siswaDemo.length} data siswa demo dibuat.`);

    // 3) Beberapa catatan izin keluar demo untuk hari ini
    const [rows] = await pool.query("SELECT id, nama, nisn, kelas FROM siswa");
    const alasanList = ["Ke toilet", "Ke UKS", "Mengambil buku", "Ke kantor TU", "Sholat"];

    let totalIzin = 0;
    for (const s of rows) {
      // jumlah keluar acak (0-3 kali) supaya data persentase terlihat variatif
      const jumlahKeluar = Math.floor(Math.random() * 4);
      for (let i = 0; i < jumlahKeluar; i++) {
        const jamKeluar = 7 + Math.floor(Math.random() * 8); // jam 07.00 - 14.00
        const alasan = alasanList[Math.floor(Math.random() * alasanList.length)];
        const sudahMasuk = Math.random() > 0.3; // sebagian masih "di luar"

        await pool.query(
          `INSERT INTO izin_keluar
            (siswa_id, nama_siswa, nisn, kelas, alasan, tanggal, waktu_keluar, waktu_masuk)
           VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
          [
            s.id,
            s.nama,
            s.nisn,
            s.kelas,
            alasan,
            `${new Date().toISOString().slice(0, 10)} ${jamKeluar}:00:00`,
            sudahMasuk
              ? `${new Date().toISOString().slice(0, 10)} ${jamKeluar}:15:00`
              : null,
          ]
        );
        totalIzin++;
      }
    }
    console.log(`✅ ${totalIzin} catatan izin keluar demo dibuat untuk hari ini.`);

    console.log("\n🎉 Seeding selesai!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal seeding data:", err);
    process.exit(1);
  }
}

seed();
