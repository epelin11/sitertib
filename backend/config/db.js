const mysql = require("mysql2/promise");
require("dotenv").config();

// Pool koneksi MySQL — dipakai ulang di seluruh aplikasi agar efisien
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sitertib_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Cek koneksi sekali saat server start, supaya error konfigurasi cepat terlihat
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Koneksi database MySQL berhasil.");
    conn.release();
  } catch (err) {
    console.error("❌ Gagal terhubung ke database MySQL:", err.message);
    console.error(
      "   Pastikan MySQL berjalan dan konfigurasi di file .env sudah benar."
    );
  }
}

module.exports = { pool, testConnection };
