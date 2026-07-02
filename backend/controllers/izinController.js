const { pool } = require("../config/db");

/**
 * POST /api/izin/keluar
 * Mencatat siswa keluar kelas.
 * Body: { nama, nisn, jenis_kelamin, kelas, alasan }
 *
 * Jika NISN belum ada di tabel siswa, siswa baru otomatis didaftarkan
 * supaya guru tidak perlu input data master secara manual lebih dulu.
 */
async function catatKeluar(req, res) {
  try {
    const { nama, nisn, jenis_kelamin, kelas, alasan } = req.body;

    if (!nama || !nisn || !jenis_kelamin || !kelas || !alasan) {
      return res.status(400).json({
        success: false,
        message: "Semua field (nama, NISN, jenis kelamin, kelas, alasan) wajib diisi.",
      });
    }

    // Cek apakah siswa dengan NISN ini sudah punya catatan "keluar" yang
    // belum kembali (waktu_masuk masih NULL) hari ini.
    const [sedangKeluar] = await pool.query(
      `SELECT id FROM izin_keluar
       WHERE nisn = ? AND tanggal = CURDATE() AND waktu_masuk IS NULL
       LIMIT 1`,
      [nisn]
    );
    if (sedangKeluar.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Siswa ini tercatat masih berada di luar kelas. Silakan catat 'Masuk Kelas' terlebih dahulu sebelum keluar lagi.",
      });
    }

    // Pastikan data master siswa ada (insert jika belum, update jika sudah)
    const [siswaRows] = await pool.query(
      "SELECT id FROM siswa WHERE nisn = ?",
      [nisn]
    );

    let siswaId;
    if (siswaRows.length === 0) {
      const [inserted] = await pool.query(
        "INSERT INTO siswa (nama, nisn, jenis_kelamin, kelas) VALUES (?, ?, ?, ?)",
        [nama, nisn, jenis_kelamin, kelas]
      );
      siswaId = inserted.insertId;
    } else {
      siswaId = siswaRows[0].id;
      await pool.query(
        "UPDATE siswa SET nama = ?, jenis_kelamin = ?, kelas = ? WHERE id = ?",
        [nama, jenis_kelamin, kelas, siswaId]
      );
    }

    await pool.query(
      `INSERT INTO izin_keluar
        (siswa_id, nama_siswa, nisn, kelas, alasan, tanggal, waktu_keluar)
       VALUES (?, ?, ?, ?, ?, CURDATE(), NOW())`,
      [siswaId, nama, nisn, kelas, alasan]
    );

    return res.status(201).json({
      success: true,
      message: `Tercatat: ${nama} keluar kelas pukul ${new Date().toLocaleTimeString(
        "id-ID"
      )}.`,
    });
  } catch (err) {
    console.error("Error catatKeluar:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    });
  }
}

/**
 * PUT /api/izin/masuk
 * Mencatat siswa kembali masuk kelas.
 * Body: { nisn }
 *
 * Mencari catatan "keluar" milik NISN tersebut hari ini yang
 * waktu_masuk-nya masih kosong, lalu mengisi waktu_masuk = sekarang.
 */
async function catatMasuk(req, res) {
  try {
    const { nisn } = req.body;

    if (!nisn) {
      return res.status(400).json({
        success: false,
        message: "NISN wajib diisi.",
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM izin_keluar
       WHERE nisn = ? AND tanggal = CURDATE() AND waktu_masuk IS NULL
       ORDER BY waktu_keluar DESC LIMIT 1`,
      [nisn]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Tidak ditemukan catatan 'keluar kelas' yang aktif untuk NISN ini hari ini.",
      });
    }

    await pool.query("UPDATE izin_keluar SET waktu_masuk = NOW() WHERE id = ?", [
      rows[0].id,
    ]);

    return res.json({
      success: true,
      message: `Tercatat: ${rows[0].nama_siswa} masuk kembali ke kelas pukul ${new Date().toLocaleTimeString(
        "id-ID"
      )}.`,
    });
  } catch (err) {
    console.error("Error catatMasuk:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    });
  }
}

module.exports = { catatKeluar, catatMasuk };
