import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DoorOpen, DoorClosed, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "../api/axiosClient";

const KELAS_OPSI = [
  "X IPA 1", "X IPA 2", "X IPS 1", "X IPS 2",
  "XI IPA 1", "XI IPA 2", "XI IPS 1", "XI IPS 2",
  "XII IPA 1", "XII IPA 2", "XII IPS 1", "XII IPS 2",
];

const ALASAN_OPSI = [
  "Ke toilet", "Ke UKS", "Mengambil buku/alat", "Ke kantor TU",
  "Sholat / ibadah", "Panggilan orang tua", "Lainnya",
];

const FORM_AWAL = {
  nama: "",
  nisn: "",
  jenis_kelamin: "Laki-laki",
  kelas: KELAS_OPSI[0],
  alasan: ALASAN_OPSI[0],
};

export default function IsiIdentitas() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "masuk" ? "masuk" : "keluar";
  const initialNisn = searchParams.get("nisn") || "";
  const [mode, setMode] = useState(initialMode); // "keluar" | "masuk"
  const [form, setForm] = useState({
    ...FORM_AWAL,
    nama: searchParams.get("nama") || FORM_AWAL.nama,
    nisn: initialNisn,
    jenis_kelamin: searchParams.get("jenis_kelamin") || FORM_AWAL.jenis_kelamin,
    kelas: searchParams.get("kelas") || FORM_AWAL.kelas,
    alasan: searchParams.get("alasan") || FORM_AWAL.alasan,
  });
  const [nisnMasuk, setNisnMasuk] = useState(initialNisn);
  const [status, setStatus] = useState(null); // { type: "success"|"error", message }
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function switchMode(newMode) {
    setMode(newMode);
    setStatus(null);
  }

  async function handleSubmitKeluar(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/izin/keluar", form);
      setStatus({ type: "success", message: res.data.message });
      setForm(FORM_AWAL);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal mengirim data. Pastikan koneksi & server backend aktif.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitMasuk(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.put("/izin/masuk", { nisn: nisnMasuk });
      setStatus({ type: "success", message: res.data.message });
      setNisnMasuk("");
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal mengirim data. Pastikan koneksi & server backend aktif.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brass-600">
          Formulir Siswa
        </span>
        <h1 className="mt-2 text-3xl font-bold">Isi Identitas Keluar / Masuk Kelas</h1>
        <p className="mt-3 text-sm text-ink-400">
          Isi formulir ini setiap kali kamu keluar kelas, lalu isi NISN lagi saat sudah kembali.
        </p>
      </div>

      {/* Tab pemilih mode */}
      <div className="mt-8 grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-1.5">
        <button
          onClick={() => switchMode("keluar")}
          className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition ${
            mode === "keluar" ? "bg-white shadow-card text-ink-800" : "text-ink-400"
          }`}
        >
          <DoorOpen className="h-4 w-4" /> Keluar Kelas
        </button>
        <button
          onClick={() => switchMode("masuk")}
          className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition ${
            mode === "masuk" ? "bg-white shadow-card text-ink-800" : "text-ink-400"
          }`}
        >
          <DoorClosed className="h-4 w-4" /> Kembali Masuk
        </button>
      </div>

      {/* Notifikasi status */}
      {status && (
        <div
          className={`mt-6 flex items-start gap-3 rounded-md border p-4 text-sm ${
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

      {/* ===== Form: Keluar Kelas ===== */}
      {mode === "keluar" && (
        <form onSubmit={handleSubmitKeluar} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label-field">Nama Lengkap</label>
            <input
              name="nama" required value={form.nama} onChange={handleChange}
              placeholder="Contoh: Ahmad Fauzi" className="input-field"
            />
          </div>

          <div>
            <label className="label-field">NISN</label>
            <input
              name="nisn" required value={form.nisn} onChange={handleChange}
              placeholder="Contoh: 0051234567" className="input-field font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Jenis Kelamin</label>
              <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} className="input-field">
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            <div>
              <label className="label-field">Kelas</label>
              <select name="kelas" value={form.kelas} onChange={handleChange} className="input-field">
                {KELAS_OPSI.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">Alasan Keluar Kelas</label>
            <select name="alasan" value={form.alasan} onChange={handleChange} className="input-field">
              {ALASAN_OPSI.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          <p className="text-xs text-ink-400">
            Waktu keluar akan dicatat otomatis oleh sistem sesuai jam saat formulir ini dikirim.
          </p>

          <button type="submit" disabled={loading} className="btn-accent w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorOpen className="h-4 w-4" />}
            {loading ? "Mengirim..." : "Catat Keluar Kelas"}
          </button>
        </form>
      )}

      {/* ===== Form: Kembali Masuk ===== */}
      {mode === "masuk" && (
        <form onSubmit={handleSubmitMasuk} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label-field">NISN</label>
            <input
              required value={nisnMasuk} onChange={(e) => setNisnMasuk(e.target.value)}
              placeholder="Masukkan NISN yang sama saat mengisi 'Keluar Kelas'"
              className="input-field font-mono"
            />
          </div>
          <p className="text-xs text-ink-400">
            Waktu masuk akan dicatat otomatis berdasarkan catatan "keluar kelas" terakhir milikmu hari ini.
          </p>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorClosed className="h-4 w-4" />}
            {loading ? "Mengirim..." : "Catat Masuk Kelas"}
          </button>
        </form>
      )}
    </div>
  );
}
