import { useEffect, useMemo, useState } from "react";
import { Users, DoorOpen, Percent, TrendingUp, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import api from "../api/axiosClient";
import StatCard from "../components/StatCard";
import PercentBar from "../components/PercentBar";

export default function DataSiswa() {
  const [data, setData] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pencarian, setPencarian] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua");

  async function muatData() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/siswa");
      setData(res.data.data);
      setRingkasan(res.data.ringkasan);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal memuat data siswa. Pastikan anda sudah login & server backend aktif."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  const daftarKelas = useMemo(
    () => ["Semua", ...new Set(data.map((s) => s.kelas))],
    [data]
  );

  const dataTersaring = useMemo(() => {
    return data
      .filter((s) => filterKelas === "Semua" || s.kelas === filterKelas)
      .filter((s) => {
        const q = pencarian.toLowerCase();
        return s.nama.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .sort((a, b) => b.persentase_keluar - a.persentase_keluar);
  }, [data, pencarian, filterKelas]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brass-600">
            Khusus Guru
          </span>
          <h1 className="mt-1 text-3xl font-bold">Data Siswa</h1>
          <p className="mt-1 text-sm text-ink-400">
            Rekap persentase keluar kelas seluruh siswa — hari ini.
          </p>
        </div>
        <button onClick={muatData} className="btn-outline">
          <RefreshCw className="h-4 w-4" /> Muat Ulang
        </button>
      </div>

      {/* ===== Loading ===== */}
      {loading && (
        <div className="mt-10 flex flex-col items-center gap-3 py-20 text-ink-400">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Memuat data siswa...</p>
        </div>
      )}

      {/* ===== Error ===== */}
      {!loading && error && (
        <div className="mt-8 flex items-start gap-3 rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ===== Kartu ringkasan persentase ===== */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Siswa" value={ringkasan?.total_siswa ?? 0} accent="ink" />
            <StatCard
              icon={DoorOpen}
              label="Keluar Kelas Hari Ini"
              value={ringkasan?.siswa_keluar_hari_ini ?? 0}
              sublabel={`${ringkasan?.total_kejadian_keluar_hari_ini ?? 0} kali kejadian`}
              accent="brass"
            />
            <StatCard
              icon={Percent}
              label="Rata-rata Persentase"
              value={`${ringkasan?.rata_rata_persentase ?? 0}%`}
              accent="success"
            />
            <StatCard
              icon={TrendingUp}
              label="Persentase Tertinggi"
              value={
                ringkasan?.siswa_persentase_tertinggi
                  ? `${ringkasan.siswa_persentase_tertinggi.persentase}%`
                  : "0%"
              }
              sublabel={ringkasan?.siswa_persentase_tertinggi?.nama || "—"}
              accent="danger"
            />
          </div>

          {ringkasan?.catatan && (
            <p className="mt-3 text-xs italic text-ink-400">{ringkasan.catatan}</p>
          )}

          {/* ===== Filter & pencarian ===== */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="input-field pl-9"
              />
            </div>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="input-field w-auto"
            >
              {daftarKelas.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>

          {/* ===== Tabel daftar siswa ===== */}
          <div className="card mt-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Nama</th>
                    <th className="px-5 py-3 font-semibold">NISN</th>
                    <th className="px-5 py-3 font-semibold">Jenis Kelamin</th>
                    <th className="px-5 py-3 font-semibold">Kelas</th>
                    <th className="px-5 py-3 font-semibold">Keluar Hari Ini</th>
                    <th className="px-5 py-3 font-semibold">Persentase Keluar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {dataTersaring.map((s) => (
                    <tr key={s.id} className="transition hover:bg-ink-50/50">
                      <td className="px-5 py-3.5 font-medium text-ink-800">{s.nama}</td>
                      <td className="px-5 py-3.5 font-mono text-ink-600">{s.nisn}</td>
                      <td className="px-5 py-3.5 text-ink-600">{s.jenis_kelamin}</td>
                      <td className="px-5 py-3.5 text-ink-600">{s.kelas}</td>
                      <td className="px-5 py-3.5 text-ink-600">{s.jumlah_keluar_hari_ini}x</td>
                      <td className="px-5 py-3.5"><PercentBar value={s.persentase_keluar} /></td>
                    </tr>
                  ))}

                  {dataTersaring.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-ink-400">
                        Tidak ada data siswa yang cocok dengan pencarian/filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
