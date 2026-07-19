const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Sesi tidak valid atau sudah kedaluwarsa. Silakan login kembali.' });
    }
    req.guru = decoded;
    next();
  });
}

module.exports = verifyToken;
