import React, { useEffect, useState } from 'react';
import { History, TrendingUp, TrendingDown, Minus, CalendarRange } from 'lucide-react';
import api from '../api/axios.js';

const KELAS_OPTIONS = ['X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1', 'XII-2'];

function formatWaktu(v) {
  if (!v) return '—';
  const d = new Date(v.replace(' ', 'T'));
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatTanggalSingkat(v) {
  if (!v) return '';
  const d = new Date(`${v}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default function Riwayat() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ tanggal: '', kelas: '', search: '' });

  const [mingguan, setMingguan] = useState(null);
  const [mingguanError, setMingguanError] = useState('');
  const [mingguanLoading, setMingguanLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.tanggal) params.tanggal = filters.tanggal;
      if (filters.kelas) params.kelas = filters.kelas;
      if (filters.search) params.search = filters.search;
      const res = await api.get('/riwayat', { params });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMingguan = async () => {
    setMingguanLoading(true);
    setMingguanError('');
    try {
      const res = await api.get('/riwayat/statistik-mingguan');
      setMingguan(res.data);
    } catch (err) {
      setMingguanError(err.response?.data?.message || 'Gagal memuat statistik mingguan.');
    } finally {
      setMingguanLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchMingguan();
  }, []);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-ink-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-600">
        <History className="h-3.5 w-3.5" /> Dashboard Guru
      </span>
      <h1 className="mt-4 text-4xl font-bold">Riwayat Keluar Masuk</h1>
      <p className="mt-2 text-ink-400">
        Seluruh catatan yang diinput oleh berbagai pengguna melalui formulir Isi Identitas.
      </p>

      {/* Presentasi Mingguan */}
      <div className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-ink-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
              Presentasi Pengisian Data Minggu Ini
            </p>
          </div>
          {mingguan && !mingguanLoading && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                mingguan.perubahanPersen > 0
                  ? 'bg-danger/10 text-danger'
                  : mingguan.perubahanPersen < 0
                  ? 'bg-success/10 text-success'
                  : 'bg-ink-50 text-ink-500'
              }`}
            >
              {mingguan.perubahanPersen > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : mingguan.perubahanPersen < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              {mingguan.perubahanPersen > 0 ? '+' : ''}
              {mingguan.perubahanPersen}% dari minggu lalu
            </span>
          )}
        </div>

        {mingguanError ? (
          <p className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            {mingguanError}
          </p>
        ) : mingguanLoading ? (
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink-400">Memuat grafik…</p>
        ) : (
          <>
            {/* Grafik batang per hari, Senin-Minggu */}
            <div className="mt-6 grid grid-cols-7 items-end gap-2 sm:gap-4" style={{ height: 140 }}>
              {mingguan.mingguIni.map((hari) => {
                const max = Math.max(...mingguan.mingguIni.map((h) => h.jumlah), 1);
                const tinggiPersen = Math.max((hari.jumlah / max) * 100, hari.jumlah > 0 ? 8 : 2);
                const hariIni = hari.tanggal === new Date().toISOString().slice(0, 10);
                return (
                  <div key={hari.tanggal} className="flex h-full flex-col items-center justify-end gap-2">
                    <span className="font-mono text-xs font-semibold text-ink-700">{hari.jumlah}</span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className={`w-full rounded-t-md ${hariIni ? 'bg-brass-500' : 'bg-ink-800'}`}
                        style={{ height: `${tinggiPersen}%` }}
                        title={`${hari.hari}: ${hari.jumlah} pengisian`}
                      />
                    </div>
                    <span className={`text-[11px] font-medium uppercase tracking-wide ${hariIni ? 'text-brass-600' : 'text-ink-400'}`}>
                      {hari.hari.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-ink-100 pt-4 text-sm">
              <p className="text-ink-500">
                Total minggu ini: <span className="font-semibold text-ink-800">{mingguan.totalMingguIni}</span> pengisian
                {' · '}minggu lalu: <span className="font-semibold text-ink-800">{mingguan.totalMingguLalu}</span>
              </p>
            </div>

            {/* Tren beberapa minggu terakhir */}
            {mingguan.tren6Minggu?.length > 1 && (
              <div className="mt-5 border-t border-dashed border-ink-100 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-400">Tren Beberapa Minggu Terakhir</p>
                <div className="space-y-2.5">
                  {mingguan.tren6Minggu.map((m, idx) => {
                    const maxTren = Math.max(...mingguan.tren6Minggu.map((t) => t.jumlah), 1);
                    const pct = Math.round((m.jumlah / maxTren) * 100);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 font-mono text-xs text-ink-500">{formatTanggalSingkat(m.mulai)}</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-50">
                          <div className="h-full rounded-full bg-ink-800" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-500">{m.jumlah}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter */}
      <div className="card mt-8 grid gap-4 p-5 sm:grid-cols-4">
        <div>
          <label className="label-field">Tanggal</label>
          <input type="date" name="tanggal" value={filters.tanggal} onChange={handleChange} className="input-field !py-2 text-sm" />
        </div>
        <div>
          <label className="label-field">Kelas</label>
          <select name="kelas" value={filters.kelas} onChange={handleChange} className="input-field !py-2 text-sm">
            <option value="">Semua Kelas</option>
            {KELAS_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Cari Nama / NISN</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            className="input-field !py-2 text-sm"
            placeholder="Ketik nama atau NISN…"
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/50 text-left">
              <Th>Siswa</Th>
              <Th>Kelas</Th>
              <Th>Keluar</Th>
              <Th>Masuk</Th>
              <Th>Alasan</Th>
              <Th>Diinput Oleh</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">Memuat riwayat…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">Belum ada catatan</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="border-b border-ink-50 align-top last:border-0 hover:bg-ink-50/40">
                  <Td>
                    <p className="font-medium text-ink-800">{r.nama}</p>
                    <p className="font-mono text-xs text-ink-400">{r.nisn}</p>
                  </Td>
                  <Td>
                    <span className="rounded-md bg-ink-50 px-2 py-0.5 font-mono text-xs text-ink-700">{r.kelas}</span>
                  </Td>
                  <Td className="font-mono text-xs">{formatWaktu(r.waktu_keluar)}</Td>
                  <Td className="font-mono text-xs">
                    {r.waktu_masuk ? (
                      formatWaktu(r.waktu_masuk)
                    ) : (
                      <span className="rounded-md border border-danger/30 bg-danger/10 px-2 py-0.5 text-[11px] uppercase tracking-widest text-danger">
                        Belum kembali
                      </span>
                    )}
                  </Td>
                  <Td className="max-w-[220px] text-ink-600">{r.alasan}</Td>
                  <Td className="text-xs text-ink-500">{r.diinput_oleh || 'Umum'}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-400">* Menampilkan maksimal 500 catatan terbaru.</p>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-ink-500">{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-5 py-3 ${className}`}>{children}</td>;
}
