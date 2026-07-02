const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
require("dotenv").config();

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi.",
      });
    }

    const [rows] = await pool.query("SELECT * FROM guru WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    const guru = rows[0];
    const cocok = await bcrypt.compare(password, guru.password);

    if (!cocok) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    const token = jwt.sign(
      { id: guru.id, nama: guru.nama, email: guru.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    return res.json({
      success: true,
      message: `Selamat datang, ${guru.nama}!`,
      token,
      guru: { id: guru.id, nama: guru.nama, email: guru.email },
    });
  } catch (err) {
    console.error("Error login:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    });
  }
}

/**
 * POST /api/auth/register
 * Body: { nama, email, password }
 * (Opsional — untuk membuat akun guru baru, misal oleh admin sekolah)
 */
async function register(req, res) {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi.",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM guru WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO guru (nama, email, password) VALUES (?, ?, ?)",
      [nama, email, hashed]
    );

    return res.status(201).json({
      success: true,
      message: "Akun guru berhasil dibuat. Silakan login.",
    });
  } catch (err) {
    console.error("Error register:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    });
  }
}

/**
 * GET /api/auth/me
 * Mengembalikan data guru yang sedang login (berdasarkan token)
 */
async function me(req, res) {
  return res.json({ success: true, guru: req.guru });
}

module.exports = { login, register, me };
