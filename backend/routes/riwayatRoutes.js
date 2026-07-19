const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// POST /api/riwayat -> form "Isi Identitas" (terbuka untuk umum, tanpa login)
// Mencatat siswa keluar kelas. Jika siswa (NISN) belum ada di database, otomatis dibuatkan.
router.post('/', async (req, res) => {
  try {
    const { nama, nisn, jenis_kelamin, kelas, waktu_keluar, waktu_masuk, alasan, diinput_oleh } = req.body;

    if (!nama || !nisn || !jenis_kelamin || !kelas || !waktu_keluar || !alasan) {
      return res.status(400).json({ message: 'Nama, NISN, jenis kelamin, kelas, waktu keluar, dan alasan wajib diisi.' });
    }

    const kelasValid = ['X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1', 'XII-2'];
    if (!kelasValid.includes(kelas)) {
      return res.status(400).json({ message: 'Kelas tidak valid.' });
    }

    // Cari atau buat data siswa berdasarkan NISN
    let siswaId;
    const [existing] = await pool.query('SELECT id FROM siswa WHERE nisn = ?', [nisn]);
    if (existing.length > 0) {
      siswaId = existing[0].id;
      await pool.query('UPDATE siswa SET nama = ?, jenis_kelamin = ?, kelas = ? WHERE id = ?', [nama, jenis_kelamin, kelas, siswaId]);
    } else {
      const [insertSiswa] = await pool.query(
        'INSERT INTO siswa (nama, nisn, jenis_kelamin, kelas) VALUES (?, ?, ?, ?)',
        [nama, nisn, jenis_kelamin, kelas]
      );
      siswaId = insertSiswa.insertId;
    }

    const [result] = await pool.query(
      `INSERT INTO riwayat_keluar_masuk (siswa_id, waktu_keluar, waktu_masuk, alasan, diinput_oleh)
       VALUES (?, ?, ?, ?, ?)`,
      [siswaId, waktu_keluar, waktu_masuk || null, alasan, diinput_oleh || 'Umum']
    );

    res.status(201).json({ message: 'Data berhasil dicatat. Terima kasih sudah tertib!', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/riwayat -> daftar riwayat keluar-masuk (khusus guru yang login)
// Query opsional: ?tanggal=YYYY-MM-DD&kelas=X-1&search=nama
router.get('/', verifyToken, async (req, res) => {
  try {
    const { tanggal, kelas, search } = req.query;
    const conditions = [];
    const params = [];

    if (tanggal) {
      conditions.push('DATE(r.waktu_keluar) = ?');
      params.push(tanggal);
    }
    if (kelas) {
      conditions.push('s.kelas = ?');
      params.push(kelas);
    }
    if (search) {
      conditions.push('(s.nama LIKE ? OR s.nisn LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT
          r.id, r.waktu_keluar, r.waktu_masuk, r.alasan, r.diinput_oleh, r.created_at,
          s.nama, s.nisn, s.jenis_kelamin, s.kelas
       FROM riwayat_keluar_masuk r
       JOIN siswa s ON s.id = r.siswa_id
       ${whereClause}
       ORDER BY r.waktu_keluar DESC
       LIMIT 500`,
      params
    );

    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// PATCH /api/riwayat/:id/masuk -> menandai siswa sudah kembali masuk kelas (terbuka untuk umum)
router.patch('/:id/masuk', async (req, res) => {
  try {
    const { id } = req.params;
    const waktuMasuk = req.body.waktu_masuk || new Date();

    const [result] = await pool.query(
      'UPDATE riwayat_keluar_masuk SET waktu_masuk = ? WHERE id = ?',
      [waktuMasuk, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data riwayat tidak ditemukan.' });
    }

    res.json({ message: 'Siswa berhasil dicatat kembali masuk kelas.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// PUT /api/riwayat/masuk-otomatis -> khusus guru (dipakai halaman Scan Identitas)
// Mencari catatan keluar siswa (berdasarkan NISN) yang masih terbuka (belum masuk)
// lalu otomatis menandainya sudah kembali masuk kelas.
router.put('/masuk-otomatis', verifyToken, async (req, res) => {
  try {
    const { nisn } = req.body;
    if (!nisn) {
      return res.status(400).json({ message: 'NISN wajib diisi.' });
    }

    const [siswaRows] = await pool.query('SELECT * FROM siswa WHERE nisn = ?', [nisn]);
    if (siswaRows.length === 0) {
      return res.status(404).json({ message: 'Siswa dengan NISN tersebut tidak ditemukan.' });
    }
    const siswa = siswaRows[0];

    const [rows] = await pool.query(
      `SELECT id FROM riwayat_keluar_masuk
       WHERE siswa_id = ? AND waktu_masuk IS NULL
       ORDER BY waktu_keluar DESC LIMIT 1`,
      [siswa.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: `${siswa.nama} tidak memiliki catatan keluar yang masih terbuka.` });
    }

    await pool.query('UPDATE riwayat_keluar_masuk SET waktu_masuk = NOW() WHERE id = ?', [rows[0].id]);

    res.json({ message: `${siswa.nama} berhasil dicatat kembali masuk kelas.`, siswa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/riwayat/statistik-mingguan -> khusus guru
// Presentasi jumlah pengisian data per hari (minggu berjalan) + tren 6 minggu terakhir
router.get('/statistik-mingguan', verifyToken, async (req, res) => {
  try {
    // Jumlah per hari pada minggu berjalan (Senin s.d. Minggu, ISO week)
    const [hariIni] = await pool.query(
      `SELECT DATE(waktu_keluar) AS tanggal, COUNT(*) AS jumlah
       FROM riwayat_keluar_masuk
       WHERE YEARWEEK(waktu_keluar, 3) = YEARWEEK(CURDATE(), 3)
       GROUP BY DATE(waktu_keluar)`
    );

    const namaHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu', 'Minggu'];
    const now = new Date();
    const hariIso = (now.getDay() + 6) % 7; // 0 = Senin
    const seninIni = new Date(now);
    seninIni.setDate(now.getDate() - hariIso);

    const petaJumlah = {};
    hariIni.forEach((r) => { petaJumlah[r.tanggal] = r.jumlah; });

    const mingguIni = Array.from({ length: 7 }).map((_, i) => {
      const tgl = new Date(seninIni);
      tgl.setDate(seninIni.getDate() + i);
      const tglStr = tgl.toISOString().slice(0, 10);
      return { hari: namaHari[i], tanggal: tglStr, jumlah: petaJumlah[tglStr] || 0 };
    });

    const totalMingguIni = mingguIni.reduce((sum, d) => sum + Number(d.jumlah), 0);

    // Total minggu lalu, untuk membandingkan persentase perubahan
    const [[{ totalMingguLalu }]] = await pool.query(
      `SELECT COUNT(*) AS totalMingguLalu FROM riwayat_keluar_masuk
       WHERE YEARWEEK(waktu_keluar, 3) = YEARWEEK(CURDATE(), 3) - 1`
    );

    let perubahanPersen = 0;
    if (totalMingguLalu > 0) {
      perubahanPersen = Number((((totalMingguIni - totalMingguLalu) / totalMingguLalu) * 100).toFixed(1));
    } else if (totalMingguIni > 0) {
      perubahanPersen = 100;
    }

    // Tren 6 minggu terakhir (untuk grafik presentasi mingguan)
    const [tren] = await pool.query(
      `SELECT YEARWEEK(waktu_keluar, 3) AS kunci_minggu, MIN(DATE(waktu_keluar)) AS mulai, COUNT(*) AS jumlah
       FROM riwayat_keluar_masuk
       WHERE waktu_keluar >= DATE_SUB(CURDATE(), INTERVAL 6 WEEK)
       GROUP BY kunci_minggu
       ORDER BY kunci_minggu ASC`
    );

    res.json({
      mingguIni,
      totalMingguIni,
      totalMingguLalu,
      perubahanPersen,
      tren6Minggu: tren.map((t) => ({ mulai: t.mulai, jumlah: Number(t.jumlah) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

module.exports = router;
