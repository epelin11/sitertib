import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Beranda from './pages/Beranda.jsx';
import Tentang from './pages/Tentang.jsx';
import IsiIdentitas from './pages/IsiIdentitas.jsx';
import Login from './pages/Login.jsx';
import DataSiswa from './pages/DataSiswa.jsx';
import Riwayat from './pages/Riwayat.jsx';
import ScanIdentitas from './pages/ScanIdentitas.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/isi-identitas" element={<IsiIdentitas />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/data-siswa"
            element={
              <ProtectedRoute>
                <DataSiswa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/riwayat"
            element={
              <ProtectedRoute>
                <Riwayat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan-identitas"
            element={
              <ProtectedRoute>
                <ScanIdentitas />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-32 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brass-600">404</p>
      <h1 className="text-3xl font-bold">Halaman tidak ditemukan</h1>
    </div>
  );
}
