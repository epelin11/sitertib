const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware untuk melindungi route yang hanya boleh diakses
 * oleh guru yang sudah login (mengirim token JWT yang valid).
 *
 * Header yang diharapkan: Authorization: Bearer <token>
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Silakan login terlebih dahulu.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.guru = decoded; // { id, nama, email }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Sesi login tidak valid atau sudah berakhir. Silakan login kembali.",
    });
  }
}

module.exports = { verifyToken };
