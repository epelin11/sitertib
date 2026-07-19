import React, { useEffect, useState } from 'react';
import { Users, DoorOpen, Clock3 } from 'lucide-react';
import api from '../api/axios.js';
import StatCard from '../components/StatCard.jsx';
import PercentBar from '../components/PercentBar.jsx';

const KELAS_OPTIONS = ['X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1', 'XII-2'];

export default function DataSiswa() {
  const [stats, setStats] = useState(null);
  const [siswa, setSiswa] = useState([]);
  const [totalKeluarHariIni, setTotalKeluarHariIni] = useState(0);
  const [kelasFilter, setKelasFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, siswaRes] = await Promise.all([
        api.get('/siswa/stats'),
        api.get('/siswa', { params: kelasFilter ? { kelas: kelasFilter } : {} }),
      ]);
      setStats(statsRes.data);
      setSiswa(siswaRes.data.data);
      setTotalKeluarHariIni(siswaRes.data.totalKeluarHariIni);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data siswa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelasFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-ink-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-600">
        Dashboard Guru
      </span>
      <h1 className="mt-4 text-4xl font-bold">Data Siswa</h1>
      <p className="mt-2 text-ink-400">Rekap dan persentase siswa yang keluar kelas hari ini.</p>

      {error && (
        <div className="mt-6 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* Kartu statistik */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <StatCard icon={Users} label="Total Siswa Terdata" value={stats?.totalSiswa ?? '—'} accent="ink" />
        <StatCard icon={DoorOpen} label="Keluar Hari Ini" value={stats?.totalKeluarHariIni ?? '—'} accent="brass" />
        <StatCard icon={Clock3} label="Belum Kembali" value={stats?.belumKembali ?? '—'} accent="danger" />
      </div>

      {/* Persentase per kelas */}
      {stats?.perKelas?.length > 0 && (
        <div className="card mt-8 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
            Persentase Keluar per Kelas Hari Ini
          </p>
          <div className="mt-5 space-y-3">
            {stats.perKelas.map((row) => {
              const max = Math.max(...stats.perKelas.map((r) => r.jumlah), 1);
              const pct = Math.round((row.jumlah / max) * 100);
              return (
                <div key={row.kelas} className="flex items-center gap-4">
                  <span className="w-14 font-mono text-sm text-ink-600">{row.kelas}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink-50">
                    <div className="h-full rounded-full bg-brass-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right font-mono text-sm text-ink-500">{row.jumlah}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabel siswa */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Daftar Siswa</p>
        <select
          value={kelasFilter}
          onChange={(e) => setKelasFilter(e.target.value)}
          className="input-field !w-auto !py-2 text-sm"
        >
          <option value="">Semua Kelas</option>
          {KELAS_OPTIONS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/50 text-left">
              <Th>Nama</Th>
              <Th>NISN</Th>
              <Th>Jenis Kelamin</Th>
              <Th>Kelas</Th>
              <Th>Keluar Hari Ini</Th>
              <Th>Persentase</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">Memuat data…</td></tr>
            ) : siswa.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">Belum ada data siswa</td></tr>
            ) : (
              siswa.map((s) => (
                <tr key={s.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                  <Td className="font-medium text-ink-800">{s.nama}</Td>
                  <Td className="font-mono text-ink-500">{s.nisn}</Td>
                  <Td>{s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</Td>
                  <Td>
                    <span className="rounded-md bg-ink-50 px-2 py-0.5 font-mono text-xs text-ink-700">{s.kelas}</span>
                  </Td>
                  <Td className="font-mono">{s.jumlah_keluar_hari_ini}×</Td>
                  <Td><PercentBar value={s.persentase} /></Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalKeluarHariIni > 0 && (
        <p className="mt-3 text-xs text-ink-400">
          * Persentase dihitung dari {totalKeluarHariIni} total kejadian keluar kelas hari ini.
        </p>
      )}
    </div>
  );
}

function Th({ children }) {
  return <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-ink-500">{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-5 py-3 ${className}`}>{children}</td>;
}
