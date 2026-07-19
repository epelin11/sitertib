import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  DoorClosed,
  DoorOpen,
  Keyboard,
  Loader2,
  ScanLine,
  VideoOff,
  UserRoundSearch,
} from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

function nowLocalDatetime() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function ScanIdentitas() {
  const { guru } = useAuth();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const scanningRef = useRef(false);
  const detectorRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');

  const [siswa, setSiswa] = useState(null); // data siswa yang ditemukan
  const [nisnTidakDikenal, setNisnTidakDikenal] = useState('');
  const [pencarianLoading, setPencarianLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [alasan, setAlasan] = useState('');
  const [waktuKeluar, setWaktuKeluar] = useState(nowLocalDatetime());
  const [aksiLoading, setAksiLoading] = useState('');

  const supportsBarcodeDetector = useMemo(() => typeof window !== 'undefined' && 'BarcodeDetector' in window, []);

  function stopCamera() {
    scanningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function cariSiswa(nisnMentah) {
    const nisn = nisnMentah.trim();
    if (!nisn) return;

    setStatus(null);
    setSiswa(null);
    setNisnTidakDikenal('');
    setPencarianLoading(true);
    try {
      const res = await api.get('/siswa/cari', { params: { nisn } });
      setSiswa(res.data);
      setAlasan('');
      setWaktuKeluar(nowLocalDatetime());
      setStatus({ type: 'success', message: `Data ${res.data.nama} berhasil ditemukan.` });
    } catch (err) {
      if (err.response?.status === 404) {
        setNisnTidakDikenal(nisn);
        setStatus({ type: 'error', message: 'NISN belum terdaftar. Lengkapi datanya lewat form Isi Identitas.' });
      } else {
        setStatus({ type: 'error', message: err.response?.data?.message || 'Gagal mencari data siswa.' });
      }
    } finally {
      setPencarianLoading(false);
      stopCamera();
    }
  }

  async function scanFrame() {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes.length > 0) {
        const nilai = barcodes[0].rawValue;
        setManualCode(nilai);
        cariSiswa(nilai);
        return;
      }
    } catch (err) {
      setCameraError(err.message || 'Kamera tidak dapat membaca barcode.');
      stopCamera();
      return;
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }

  async function startCamera() {
    setCameraError('');
    setStatus(null);

    if (!supportsBarcodeDetector) {
      setCameraError('Browser ini belum mendukung scan barcode otomatis (coba Chrome/Edge versi terbaru), gunakan input manual di bawah.');
      return;
    }

    try {
      detectorRef.current = new window.BarcodeDetector({
        formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e'],
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      scanningRef.current = true;
      setCameraActive(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      setCameraError(err.message || 'Tidak bisa mengakses kamera. Pastikan izin kamera diberikan.');
      stopCamera();
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    cariSiswa(manualCode);
  }

  async function catatKeluar(e) {
    e.preventDefault();
    if (!siswa) return;
    if (!alasan.trim()) {
      setStatus({ type: 'error', message: 'Alasan keluar wajib diisi.' });
      return;
    }
    setAksiLoading('keluar');
    setStatus(null);
    try {
      await api.post('/riwayat', {
        nama: siswa.nama,
        nisn: siswa.nisn,
        jenis_kelamin: siswa.jenis_kelamin,
        kelas: siswa.kelas,
        waktu_keluar: waktuKeluar,
        alasan,
        diinput_oleh: guru?.nama ? `${guru.nama} (Scan)` : 'Guru (Scan)',
      });
      setStatus({ type: 'success', message: `${siswa.nama} berhasil dicatat keluar kelas.` });
      setSiswa(null);
      setManualCode('');
      setAlasan('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Gagal mencatat keluar kelas.' });
    } finally {
      setAksiLoading('');
    }
  }

  async function catatMasuk() {
    if (!siswa) return;
    setAksiLoading('masuk');
    setStatus(null);
    try {
      const res = await api.put('/riwayat/masuk-otomatis', { nisn: siswa.nisn });
      setStatus({ type: 'success', message: res.data.message });
      setSiswa(null);
      setManualCode('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Gagal mencatat masuk kembali.' });
    } finally {
      setAksiLoading('');
    }
  }

  useEffect(() => stopCamera, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brass-600">Khusus Guru</span>
          <h1 className="mt-1 text-3xl font-bold">Scan Identitas Siswa</h1>
          <p className="mt-2 text-sm text-ink-400">
            Scan kartu/QR siswa untuk mempercepat pencatatan keluar-masuk kelas tanpa mengetik ulang data.
          </p>
        </div>
        <Link to="/isi-identitas" className="btn-outline">
          <DoorOpen className="h-4 w-4" /> Form Manual
        </Link>
      </div>

      {/* Kamera */}
      <div className="card mt-8 overflow-hidden">
        <div className="relative aspect-video bg-ink-900">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
              <ScanLine className="h-12 w-12 text-brass-300" />
              <p className="text-sm text-white/80">Arahkan kamera ke barcode atau QR pada kartu siswa.</p>
            </div>
          )}
          {cameraActive && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-36 w-64 rounded-lg border-2 border-brass-300 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
            </div>
          )}
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <button type="button" onClick={startCamera} disabled={cameraActive} className="btn-primary">
            <ScanLine className="h-4 w-4" /> {cameraActive ? 'Kamera Aktif' : 'Mulai Scan'}
          </button>
          <button type="button" onClick={stopCamera} className="btn-outline">
            <VideoOff className="h-4 w-4" /> Matikan Kamera
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="mt-5 flex items-start gap-3 rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{cameraError}</p>
        </div>
      )}

      {/* Input manual / hasil scanner fisik */}
      <form onSubmit={handleManualSubmit} className="card mt-5 flex flex-col gap-3 p-5 sm:flex-row">
        <div className="flex-1">
          <label className="label-field">Input Manual / Hasil Scanner Fisik (NISN)</label>
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Ketik atau tempel NISN di sini"
            className="input-field font-mono"
          />
        </div>
        <button type="submit" disabled={pencarianLoading} className="btn-accent self-end">
          {pencarianLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Keyboard className="h-4 w-4" />}
          Cari Siswa
        </button>
      </form>

      {status && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-md border p-4 text-sm ${
            status.type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p>{status.message}</p>
        </div>
      )}

      {nisnTidakDikenal && (
        <div className="card mt-5 flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="flex items-center gap-2 text-sm text-ink-600">
            <UserRoundSearch className="h-4 w-4 text-ink-400" />
            NISN <span className="font-mono font-semibold text-ink-800">{nisnTidakDikenal}</span> belum ada di database.
          </p>
          <Link to={`/isi-identitas?nisn=${encodeURIComponent(nisnTidakDikenal)}`} className="btn-outline shrink-0">
            Daftarkan via Form Manual
          </Link>
        </div>
      )}

      {siswa && (
        <div className="card mt-5 p-5">
          <h2 className="text-lg font-semibold">Data Terbaca</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-400">NISN</dt>
              <dd className="font-mono font-semibold text-ink-800">{siswa.nisn}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Nama</dt>
              <dd className="font-medium text-ink-800">{siswa.nama}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Kelas</dt>
              <dd className="font-medium text-ink-800">{siswa.kelas}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Jenis Kelamin</dt>
              <dd className="font-medium text-ink-800">{siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</dd>
            </div>
          </dl>

          {/* Form ringkas untuk catat keluar */}
          <form onSubmit={catatKeluar} className="mt-5 space-y-4 border-t border-dashed border-ink-100 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Waktu Keluar</label>
                <input
                  type="datetime-local"
                  value={waktuKeluar}
                  onChange={(e) => setWaktuKeluar(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Alasan Keluar *</label>
                <input
                  type="text"
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="input-field"
                  placeholder="cth. Ke toilet, ke UKS, dsb."
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="submit" disabled={aksiLoading === 'keluar'} className="btn-accent">
                {aksiLoading === 'keluar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorOpen className="h-4 w-4" />}
                {aksiLoading === 'keluar' ? 'Mencatat…' : 'Catat Keluar Kelas'}
              </button>
              <button type="button" onClick={catatMasuk} disabled={aksiLoading === 'masuk'} className="btn-primary">
                {aksiLoading === 'masuk' ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorClosed className="h-4 w-4" />}
                {aksiLoading === 'masuk' ? 'Mencatat…' : 'Catat Masuk Kembali'}
              </button>
            </div>
            <p className="text-xs text-ink-400">
              "Catat Masuk Kembali" akan menutup catatan keluar terbaru siswa ini yang masih terbuka.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
