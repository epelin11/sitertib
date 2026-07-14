import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  DoorClosed,
  DoorOpen,
  Keyboard,
  Loader2,
  ScanLine,
  VideoOff,
} from "lucide-react";
import api from "../api/axiosClient";

function parseBarcode(rawValue) {
  const value = rawValue.trim();

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return {
        raw: value,
        nama: parsed.nama || parsed.name || "",
        nisn: parsed.nisn || parsed.nis || parsed.id || "",
        jenis_kelamin: parsed.jenis_kelamin || parsed.gender || "",
        kelas: parsed.kelas || parsed.class || "",
        alasan: parsed.alasan || "",
      };
    }
  } catch {
    // Barcode biasa biasanya hanya berisi NISN atau teks pendek.
  }

  const params = new URLSearchParams(value.includes("?") ? value.split("?").at(-1) : value);
  const nisnFromParams = params.get("nisn") || params.get("nis") || params.get("id");

  return {
    raw: value,
    nama: params.get("nama") || "",
    nisn: nisnFromParams || value.replace(/^NISN[:\s-]*/i, ""),
    jenis_kelamin: params.get("jenis_kelamin") || "",
    kelas: params.get("kelas") || "",
    alasan: params.get("alasan") || "",
  };
}

export default function ScanBarcode() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const scanningRef = useRef(false);
  const detectorRef = useRef(null);
  const navigate = useNavigate();

  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [hasilScan, setHasilScan] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const supportsBarcodeDetector = useMemo(() => "BarcodeDetector" in window, []);

  function stopCamera() {
    scanningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  function setScanValue(value) {
    const parsed = parseBarcode(value);
    if (!parsed.nisn) {
      setStatus({ type: "error", message: "Barcode terbaca, tetapi NISN tidak ditemukan." });
      return;
    }
    setHasilScan(parsed);
    setManualCode(parsed.raw);
    setStatus({ type: "success", message: `NISN ${parsed.nisn} berhasil terbaca.` });
    stopCamera();
  }

  async function scanFrame() {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes.length > 0) {
        setScanValue(barcodes[0].rawValue);
        return;
      }
    } catch (err) {
      setCameraError(err.message || "Kamera tidak dapat membaca barcode.");
      stopCamera();
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }

  async function startCamera() {
    setCameraError("");
    setStatus(null);

    if (!supportsBarcodeDetector) {
      setCameraError("Browser ini belum mendukung scan barcode otomatis. Gunakan Chrome/Edge terbaru atau input manual.");
      return;
    }

    try {
      detectorRef.current = new window.BarcodeDetector({
        formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "itf", "upc_a", "upc_e"],
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      scanningRef.current = true;
      setCameraActive(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      setCameraError(err.message || "Tidak bisa mengakses kamera. Pastikan izin kamera diberikan.");
      stopCamera();
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setScanValue(manualCode);
  }

  function bukaFormKeluar() {
    if (!hasilScan?.nisn) return;
    const params = new URLSearchParams({ mode: "keluar", nisn: hasilScan.nisn });
    ["nama", "jenis_kelamin", "kelas", "alasan"].forEach((key) => {
      if (hasilScan[key]) params.set(key, hasilScan[key]);
    });
    navigate(`/isi-identitas?${params.toString()}`);
  }

  async function catatMasuk() {
    if (!hasilScan?.nisn) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.put("/izin/masuk", { nisn: hasilScan.nisn });
      setStatus({ type: "success", message: res.data.message });
      setHasilScan(null);
      setManualCode("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Gagal mencatat masuk. Pastikan backend aktif.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => stopCamera, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brass-600">
            Khusus Guru
          </span>
          <h1 className="mt-1 text-3xl font-bold">Scan Barcode Siswa</h1>
          <p className="mt-2 text-sm text-ink-400">
            Scan kartu siswa untuk mempercepat pengisian NISN dan pencatatan masuk kelas.
          </p>
        </div>
        <Link to="/isi-identitas" className="btn-outline">
          <DoorOpen className="h-4 w-4" /> Form Manual
        </Link>
      </div>

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
            <ScanLine className="h-4 w-4" /> {cameraActive ? "Kamera Aktif" : "Mulai Scan"}
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

      <form onSubmit={handleManualSubmit} className="card mt-5 flex flex-col gap-3 p-5 sm:flex-row">
        <div className="flex-1">
          <label className="label-field">Input Manual / Hasil Scanner Fisik</label>
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Tempel atau ketik NISN/barcode di sini"
            className="input-field font-mono"
          />
        </div>
        <button type="submit" className="btn-accent self-end">
          <Keyboard className="h-4 w-4" /> Pakai Kode
        </button>
      </form>

      {status && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-md border p-4 text-sm ${
            status.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p>{status.message}</p>
        </div>
      )}

      {hasilScan && (
        <div className="card mt-5 p-5">
          <h2 className="text-lg font-semibold">Data Terbaca</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-400">NISN</dt>
              <dd className="font-mono font-semibold text-ink-800">{hasilScan.nisn}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Nama</dt>
              <dd className="font-medium text-ink-800">{hasilScan.nama || "-"}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Kelas</dt>
              <dd className="font-medium text-ink-800">{hasilScan.kelas || "-"}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Jenis Kelamin</dt>
              <dd className="font-medium text-ink-800">{hasilScan.jenis_kelamin || "-"}</dd>
            </div>
          </dl>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={bukaFormKeluar} className="btn-accent">
              <DoorOpen className="h-4 w-4" /> Isi Keluar Kelas
            </button>
            <button type="button" onClick={catatMasuk} disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorClosed className="h-4 w-4" />}
              {loading ? "Mencatat..." : "Catat Masuk"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
