# 🚀 Deployment Guide - Render.com

Panduan lengkap untuk deploy SI TERTIB Backend ke Render.com

## 📋 Prerequisites

- [Render.com Account](https://render.com) (gratis)
- Backend repository di GitHub (sudah ada ✅)
- Database MySQL (PlanetScale / Railway / Aiven)
- Frontend sudah di-host (Vercel / Netlify / Render)

---

## 1️⃣ Setup Database MySQL (PlanetScale / Aiven / Railway)

### Option A: PlanetScale (Rekomendasi - Free tier tersedia)

1. Daftar di [PlanetScale.com](https://planetscale.com)
2. Buat database baru: `sitertib_db`
3. Buat user baru dengan password
4. Copy **Connection String** (format: `mysql://user:pass@host/db`)
5. Jalankan script `backend/schema.sql` via PlanetScale dashboard atau via CLI

**Getting Connection String:**
```
Main branch → Connect → Create password → Copy MySQL Connection String
```

### Option B: Railway atau Aiven

Mirip dengan PlanetScale, tapi bisa pakai managed MySQL.

---

## 2️⃣ Deploy Backend ke Render

### Step 1: Siapkan Repository

Pastikan file `.env.production` sudah ada (sudah kami buat ✅)

```bash
git add .env.production
git commit -m "Add production env template"
git push origin main
```

### Step 2: Login ke Render & Create Service

1. Buka [Render Dashboard](https://dashboard.render.com)
2. Klik **"New +"** → **"Web Service"**
3. Pilih **"Deploy an existing Git repository"** atau connect GitHub
4. Pilih repository **`epelin11/sitertib`**
5. Branch: **`main`**

### Step 3: Konfigurasi Service

| Setting | Value |
|---------|-------|
| **Name** | `sitertib-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### Step 4: Set Environment Variables

Di Render Dashboard → Web Service → Environment:

```env
NODE_ENV=production
DB_HOST=your_planetscale_host
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=sitertib_db
JWT_SECRET=your_random_secure_key_min_32_chars
JWT_EXPIRES_IN=8h
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 5: Deploy

Klik **"Deploy"** dan tunggu proses build & deploy selesai.

**Output URL:** `https://sitertib-backend.onrender.com`

---

## 3️⃣ Update Frontend API URL

Setelah backend live di Render:

1. Buka `frontend/.env.production`
2. Update API URL:
```env
VITE_API_URL=https://sitertib-backend.onrender.com/api
```

3. Deploy frontend ke Vercel / Netlify / Render

---

## 4️⃣ Testing Production

### Test Backend Health Check

```bash
curl https://sitertib-backend.onrender.com/
```

Expected Response:
```json
{
  "message": "SI TERTIB API aktif."
}
```

### Test API Login

```bash
curl -X POST https://sitertib-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guru@example.com","password":"password123"}'
```

---

## 5️⃣ Database Migration (First Time Only)

Setelah database MySQL sudah siap di cloud:

**Via MySQL CLI:**
```bash
mysql -h your_host -u your_user -p < backend/schema.sql
```

**Via PlanetScale Web Console:**
- Salin isi file `backend/schema.sql`
- Paste di SQL Editor
- Execute

---

## 🔒 Security Checklist

- ✅ Jangan expose `.env` file ke GitHub
- ✅ Gunakan environment variables yang berbeda untuk dev vs production
- ✅ JWT_SECRET minimal 32 karakter, random, tidak mudah ditebak
- ✅ CORS sudah dikonfigurasi untuk frontend URL yang benar
- ✅ Database password tidak boleh di-commit

---

## 📊 Environment Comparison

| Aspek | Development | Production |
|-------|-------------|------------|
| **Port** | 5000 | 3000 (atau Render auto-assign) |
| **Database** | localhost | PlanetScale / Aiven / Railway |
| **JWT Secret** | bisa sederhana | harus kompleks & random |
| **CORS** | http://localhost:5173 | https://frontend-domain.com |
| **Node Env** | development | production |

---

## 🐛 Troubleshooting

### Build Failed
- Cek build logs di Render Dashboard
- Pastikan `backend/package.json` sudah ada
- Jalankan `npm install` lokal untuk test

### Database Connection Error
- Cek DB_HOST, DB_USER, DB_PASSWORD di environment variables
- Pastikan database sudah created & schema sudah imported
- Test connection lokal: `mysql -h host -u user -p -D database`

### API 502 Bad Gateway
- Cek logs di Render Dashboard
- Pastikan server.js tidak ada error
- Test lokal: `node server.js`

---

## 📝 Catatan

- Render free tier tidur setelah 15 menit inaktif (spin up ~30 detik)
- Untuk production stabil, upgrade ke paid tier
- PlanetScale free tier: 10 database, unlimited data, limited bandwidth
- Backup database secara berkala!

---

## 📞 Support Links

- Render Docs: https://render.com/docs
- PlanetScale Docs: https://planetscale.com/docs
- Express + MySQL Guide: https://expressjs.com/

---

**Happy Deploying! 🚀**
