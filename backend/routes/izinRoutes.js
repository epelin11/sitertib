const express = require("express");
const router = express.Router();
const { catatKeluar, catatMasuk } = require("../controllers/izinController");

// Route ini PUBLIK (tidak perlu login) — diisi langsung oleh siswa
// melalui halaman "Isi Identitas" di website.
router.post("/keluar", catatKeluar);
router.put("/masuk", catatMasuk);

module.exports = router;
