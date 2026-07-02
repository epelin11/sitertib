const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const izinRoutes = require("./routes/izinRoutes");
const siswaRoutes = require("./routes/siswaRoutes");

const app = express();

// ----- Middleware global -----
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// ----- Routes -----
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SI TERTIB API aktif 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/izin", izinRoutes);
app.use("/api/siswa", siswaRoutes);

// ----- 404 handler -----
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

// ----- Error handler umum -----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🚀 Server SI TERTIB berjalan di http://localhost:${PORT}`);
  await testConnection();
});
