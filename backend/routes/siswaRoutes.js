const express = require("express");
const router = express.Router();
const { getDataSiswa } = require("../controllers/siswaController");
const { verifyToken } = require("../middleware/auth");

// Route ini DILINDUNGI — hanya guru yang sudah login (punya token) yang bisa akses.
router.get("/", verifyToken, getDataSiswa);

module.exports = router;
