const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/siswa -> daftar siswa + jumlah keluar hari ini + persentase
// Dilindungi login (hanya guru yang sudah login yang bisa melihat data siswa)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { kelas } = req.query;

    let filterClause = '';
    const params = [];
    if (kelas) {
      filterClause = 'WHERE s.kelas = ?';
      params.push(kelas);
    }

    // Jumlah keluar per siswa (hari ini)
    const [rows] = await pool.query(
      `SELECT
          s.id, s.nama, s.nisn, s.jenis_kelamin, s.kelas,
          COALESCE(r.jumlah_keluar, 0) AS jumlah_keluar_hari_ini
       FROM siswa s
       LEFT JOIN (
          SELECT siswa_id, COUNT(*) AS jumlah_keluar
          FROM riwayat_keluar_masuk
          WHERE DATE(waktu_keluar) = CURDATE()
          GROUP BY siswa_id
       ) r ON r.siswa_id = s.id
       ${filterClause}
       ORDER BY jumlah_keluar_hari_ini DESC, s.nama ASC`,
      params
    );

    const totalKeluarHariIni = rows.reduce((sum, r) => sum + Number(r.jumlah_keluar_hari_ini), 0);

    const data = rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      nisn: r.nisn,
      jenis_kelamin: r.jenis_kelamin,
      kelas: r.kelas,
      jumlah_keluar_hari_ini: Number(r.jumlah_keluar_hari_ini),
      persentase: totalKeluarHariIni > 0
        ? Number(((r.jumlah_keluar_hari_ini / totalKeluarHariIni) * 100).toFixed(1))
        : 0,
    }));

    res.json({ data, totalKeluarHariIni });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/siswa/stats -> ringkasan statistik untuk kartu dashboard
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [[{ totalSiswa }]] = await pool.query('SELECT COUNT(*) AS totalSiswa FROM siswa');
    const [[{ totalKeluarHariIni }]] = await pool.query(
      `SELECT COUNT(*) AS totalKeluarHariIni FROM riwayat_keluar_masuk WHERE DATE(waktu_keluar) = CURDATE()`
    );
    const [[{ belumKembali }]] = await pool.query(
      `SELECT COUNT(*) AS belumKembali FROM riwayat_keluar_masuk WHERE DATE(waktu_keluar) = CURDATE() AND waktu_masuk IS NULL`
    );
    const [perKelas] = await pool.query(
      `SELECT s.kelas, COUNT(r.id) AS jumlah
       FROM siswa s
       LEFT JOIN riwayat_keluar_masuk r ON r.siswa_id = s.id AND DATE(r.waktu_keluar) = CURDATE()
       GROUP BY s.kelas
       ORDER BY s.kelas ASC`
    );

    res.json({
      totalSiswa,
      totalKeluarHariIni,
      belumKembali,
      perKelas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/siswa/cari?nisn=... -> mencari siswa berdasarkan NISN (dipakai form Isi Identitas)
router.get('/cari', async (req, res) => {
  try {
    const { nisn } = req.query;
    if (!nisn) return res.status(400).json({ message: 'NISN wajib diisi.' });

    const [rows] = await pool.query('SELECT * FROM siswa WHERE nisn = ?', [nisn]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Siswa dengan NISN tersebut tidak ditemukan.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

module.exports = router;
