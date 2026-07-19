import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ nama: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/data-siswa';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email: form.email, password: form.password });
        login(res.data.token, res.data.guru);
        navigate(from, { replace: true });
      } else {
        await api.post('/auth/register', form);
        setMode('login');
        setError('');
        setForm({ nama: '', email: form.email, password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <span className="stamp h-14 w-14 text-[10px]">
          {mode === 'login' ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
        </span>
      </div>
      <h1 className="mt-5 text-center text-3xl font-bold">
        {mode === 'login' ? 'Login Guru' : 'Daftar Akun Guru'}
      </h1>
      <p className="mt-2 text-center text-sm text-ink-400">
        {mode === 'login'
          ? 'Masuk untuk mengakses Data Siswa dan Riwayat.'
          : 'Buat akun baru untuk mengakses dashboard guru.'}
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-7 sm:p-9">
        {mode === 'register' && (
          <div>
            <label className="label-field">Nama Guru</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="input-field"
              placeholder="cth. Budi Santoso, S.Pd"
              required
            />
          </div>
        )}
        <div>
          <label className="label-field">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
            placeholder="nama@sekolah.sch.id"
            required
          />
        </div>
        <div>
          <label className="label-field">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="input-field"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {loading ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>

        <p className="text-center text-sm text-ink-500">
          {mode === 'login' ? (
            <>
              Belum punya akun?{' '}
              <button type="button" onClick={() => { setMode('register'); setError(''); }} className="font-semibold text-brass-600 hover:underline">
                Daftar di sini
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className="font-semibold text-brass-600 hover:underline">
                Login di sini
              </button>
            </>
          )}
        </p>
      </form>

      <p className="mt-6 text-center">
        <Link to="/" className="text-xs font-semibold uppercase tracking-widest text-ink-400 hover:text-ink-700">
          ← Kembali ke Beranda
        </Link>
      </p>
    </div>
  );
}
