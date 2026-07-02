const { pool } = require("../config/db");
require("dotenv").config();

// Asumsi: jumlah maksimum "keluar kelas" yang dianggap 100% dalam satu hari.
// Diatur lewat .env (MAX_KELUAR_PER_HARI), default 6 — silakan sesuaikan
// dengan jumlah jam pelajaran per hari di sekolah anda.
const MAX_KELUAR_PER_HARI = parseInt(process.env.MAX_KELUAR_PER_HARI, 10) || 6;

/**
 * GET /api/siswa
 * (Dilindungi token guru)
 * Mengembalikan:
 *  - daftar siswa lengkap dengan jumlah & persentase keluar kelas HARI INI
 *  - ringkasan statistik untuk ditampilkan sebagai kartu persentase
 */
async function getDataSiswa(req, res) {
  try {
    const [siswa] = await pool.query("SELECT * FROM siswa ORDER BY kelas, nama");

    const [izinHariIni] = await pool.query(
      `SELECT nisn, COUNT(*) AS jumlah_keluar
       FROM izin_keluar
       WHERE tanggal = CURDATE()
       GROUP BY nisn`
    );

    // Map nisn -> jumlah keluar hari ini, untuk lookup cepat
    const peta = {};
    izinHariIni.forEach((row) => {
      peta[row.nisn] = row.jumlah_keluar;
    });

    const daftarSiswa = siswa.map((s) => {
      const jumlahKeluar = peta[s.nisn] || 0;
      const persentase = Math.min(
        Math.round((jumlahKeluar / MAX_KELUAR_PER_HARI) * 100),
        100
      );
      return {
        id: s.id,
        nama: s.nama,
        nisn: s.nisn,
        jenis_kelamin: s.jenis_kelamin,
        kelas: s.kelas,
        jumlah_keluar_hari_ini: jumlahKeluar,
        persentase_keluar: persentase,
      };
    });

    // Ringkasan statistik untuk kartu di atas tabel
    const totalSiswa = daftarSiswa.length;
    const siswaKeluarHariIni = daftarSiswa.filter(
      (s) => s.jumlah_keluar_hari_ini > 0
    ).length;
    const totalKeluarHariIni = daftarSiswa.reduce(
      (acc, s) => acc + s.jumlah_keluar_hari_ini,
      0
    );
    const rataRataPersentase = totalSiswa
      ? Math.round(
          daftarSiswa.reduce((acc, s) => acc + s.persentase_keluar, 0) /
            totalSiswa
        )
      : 0;

    const siswaTertinggi = [...daftarSiswa].sort(
      (a, b) => b.persentase_keluar - a.persentase_keluar
    )[0];

    return res.json({
      success: true,
      ringkasan: {
        total_siswa: totalSiswa,
        siswa_keluar_hari_ini: siswaKeluarHariIni,
        total_kejadian_keluar_hari_ini: totalKeluarHariIni,
        rata_rata_persentase: rataRataPersentase,
        siswa_persentase_tertinggi: siswaTertinggi
          ? {
              nama: siswaTertinggi.nama,
              kelas: siswaTertinggi.kelas,
              persentase: siswaTertinggi.persentase_keluar,
            }
          : null,
        catatan: `Persentase dihitung dari jumlah keluar kelas hari ini dibanding asumsi maksimum ${MAX_KELUAR_PER_HARI}x/hari.`,
      },
      data: daftarSiswa,
    });
  } catch (err) {
    console.error("Error getDataSiswa:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    });
  }
}

module.exports = { getDataSiswa };
