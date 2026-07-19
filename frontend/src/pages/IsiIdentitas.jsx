import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DoorOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios.js';

const KELAS_OPTIONS = ['X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1', 'XII-2'];

function nowLocalDatetime() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function IsiIdentitas() {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    nama: searchParams.get('nama') || '',
    nisn: searchParams.get('nisn') || '',
    jenis_kelamin: searchParams.get('jenis_kelamin') || '',
    kelas: searchParams.get('kelas') || '',
    waktu_keluar: nowLocalDatetime(),
    waktu_masuk: '',
    alasan: searchParams.get('alasan') || '',
    diinput_oleh: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      nama: '',
      nisn: '',
      jenis_kelamin: '',
      kelas: '',
      waktu_keluar: nowLocalDatetime(),
      waktu_masuk: '',
      alasan: '',
      diinput_oleh: form.diinput_oleh,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.nama || !form.nisn || !form.jenis_kelamin || !form.kelas || !form.waktu_keluar || !form.alasan) {
      setStatus({ type: 'error', message: 'Mohon lengkapi semua kolom wajib (bertanda *).' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/riwayat', form);
      setStatus({ type: 'success', message: 'Data berhasil dicatat. Terima kasih sudah tertib!' });
      resetForm();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengirim data. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-brass-500/30 bg-brass-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-brass-600">
        Formulir Terbuka
      </span>
      <h1 className="mt-4 text-4xl font-bold">Isi Identitas Keluar/Masuk</h1>
      <p className="mt-2 text-ink-400">Isi formulir ini setiap kali siswa izin keluar kelas. Tidak perlu login.</p>

      <form onSubmit={handleSubmit} className="card mt-10 space-y-6 p-7 sm:p-9">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-field">Nama Siswa *</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="input-field"
              placeholder="cth. Ahmad Fauzi"
            />
          </div>
          <div>
            <label className="label-field">NISN *</label>
            <input
              type="text"
              name="nisn"
              value={form.nisn}
              onChange={handleChange}
              className="input-field"
              placeholder="cth. 0051234567"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-field">Jenis Kelamin *</label>
            <div className="mt-1 flex gap-3">
              {[{ v: 'L', t: 'Laki-laki' }, { v: 'P', t: 'Perempuan' }].map((opt) => (
                <label
                  key={opt.v}
                  className={`flex-1 cursor-pointer rounded-md border px-4 py-2.5 text-center text-sm font-medium transition ${
                    form.jenis_kelamin === opt.v
                      ? 'border-ink-800 bg-ink-800 text-white'
                      : 'border-ink-200 text-ink-600 hover:border-ink-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenis_kelamin"
                    value={opt.v}
                    checked={form.jenis_kelamin === opt.v}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {opt.t}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label-field">Kelas *</label>
            <select name="kelas" value={form.kelas} onChange={handleChange} className="input-field">
              <option value="">Pilih kelas</option>
              {KELAS_OPTIONS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-field">Waktu Keluar *</label>
            <input
              type="datetime-local"
              name="waktu_keluar"
              value={form.waktu_keluar}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Waktu Masuk (opsional)</label>
            <input
              type="datetime-local"
              name="waktu_masuk"
              value={form.waktu_masuk}
              onChange={handleChange}
              className="input-field"
            />
            <p className="mt-1 text-xs text-ink-400">Kosongkan jika siswa belum kembali ke kelas.</p>
          </div>
        </div>

        <div>
          <label className="label-field">Alasan Keluar *</label>
          <textarea
            name="alasan"
            value={form.alasan}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="cth. Ke toilet, ke UKS, izin ke perpustakaan, dsb."
          />
        </div>

        <div>
          <label className="label-field">Nama Pengisi (opsional)</label>
          <input
            type="text"
            name="diinput_oleh"
            value={form.diinput_oleh}
            onChange={handleChange}
            className="input-field"
            placeholder="cth. Guru Piket Budi / Petugas Satpam"
          />
        </div>

        {status.message && (
          <div
            className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-medium ${
              status.type === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-danger/30 bg-danger/10 text-danger'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {status.message}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-accent w-full">
          <DoorOpen className="h-4 w-4" />
          {loading ? 'Mengirim…' : 'Simpan Catatan'}
        </button>
      </form>
    </div>
  );
}
