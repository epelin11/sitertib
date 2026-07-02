import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogIn, UserPlus, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosClient";

export default function Login() {
  const [tab, setTab] = useState("login"); // "login" | "daftar"
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [daftarForm, setDaftarForm] = useState({ nama: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tujuan = location.state?.from?.pathname || "/data-siswa";

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate(tujuan, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDaftar(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api.post("/auth/register", daftarForm);
      setInfo("Akun berhasil dibuat. Silakan login dengan akun baru anda.");
      setLoginForm({ email: daftarForm.email, password: "" });
      setTab("login");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat akun. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="stamp mx-auto h-14 w-14 text-[10px]">Guru</span>
        <h1 className="mt-4 text-2xl font-bold">Portal Guru &amp; Staf</h1>
        <p className="mt-2 text-sm text-ink-400">
          Khusus guru/staf sekolah, untuk mengakses halaman Data Siswa.
        </p>
      </div>

      {/* Tab */}
      <div className="mt-8 grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-1.5">
        <button
          onClick={() => { setTab("login"); setError(""); }}
          className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition ${
            tab === "login" ? "bg-white shadow-card text-ink-800" : "text-ink-400"
          }`}
        >
          <LogIn className="h-4 w-4" /> Masuk
        </button>
        <button
          onClick={() => { setTab("daftar"); setError(""); }}
          className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition ${
            tab === "daftar" ? "bg-white shadow-card text-ink-800" : "text-ink-400"
          }`}
        >
          <UserPlus className="h-4 w-4" /> Daftar Akun
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/10 p-3.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {info && tab === "login" && (
        <div className="mt-6 flex items-start gap-2.5 rounded-md border border-success/30 bg-success/10 p-3.5 text-sm text-success">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> {info}
        </div>
      )}

      {/* Form Login */}
      {tab === "login" ? (
        <form onSubmit={handleLogin} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label-field">Email</label>
            <input
              type="email" required className="input-field"
              placeholder="guru@sitertib.sch.id"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Password</label>
            <input
              type="password" required className="input-field"
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Memproses..." : "Masuk"}
          </button>
          <p className="text-center text-xs text-ink-400">
            Akun demo: guru@sitertib.sch.id / admin123
          </p>
        </form>
      ) : (
        <form onSubmit={handleDaftar} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label-field">Nama Lengkap</label>
            <input
              required className="input-field" placeholder="Contoh: Budi Santoso, S.Pd."
              value={daftarForm.nama}
              onChange={(e) => setDaftarForm({ ...daftarForm, nama: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input
              type="email" required className="input-field" placeholder="nama@sekolah.sch.id"
              value={daftarForm.email}
              onChange={(e) => setDaftarForm({ ...daftarForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Password</label>
            <input
              type="password" required minLength={6} className="input-field" placeholder="Minimal 6 karakter"
              value={daftarForm.password}
              onChange={(e) => setDaftarForm({ ...daftarForm, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {loading ? "Memproses..." : "Buat Akun Guru"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-400">
        Bukan guru/staf?{" "}
        <Link to="/isi-identitas" className="font-medium text-ink-800 hover:text-brass-600">
          Isi identitas keluar/masuk kelas di sini
        </Link>
      </p>
    </div>
  );
}
