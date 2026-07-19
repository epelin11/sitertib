import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  DoorOpen,
  ClipboardList,
  BarChart3,
  History,
  ShieldCheck,
  ArrowRight,
  LogIn,
} from 'lucide-react';

export default function Beranda() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-ink-800">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 27px, #fff 28px)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          {/* Teks hero */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brass-500/40 bg-brass-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-brass-200">
              Sistem Informasi Sekolah
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              Setiap siswa yang keluar kelas,
              <span className="text-brass-400"> tercatat tertib.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-100/80">
              SI TERTIB mencatat waktu, alasan, dan kelas setiap siswa yang izin keluar masuk —
              supaya wali kelas dan guru piket punya data yang jelas, bukan sekadar catatan di kertas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/isi-identitas" className="btn-accent">
                <DoorOpen className="h-4 w-4" /> Isi Identitas Keluar/Masuk
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/data-siswa"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <BarChart3 className="h-4 w-4" /> Lihat Data Siswa
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" /> Login Guru
                </Link>
              )}
            </div>
          </div>

          {/* Visual: kartu catatan + stempel berputar (elemen signature) */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="card relative rotate-1 bg-white p-6">
              <p className="font-display text-sm font-semibold text-ink-400">
                Catatan Keluar Kelas
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-dashed border-ink-100 pb-2">
                  <dt className="text-ink-400">Nama</dt>
                  <dd className="font-medium text-ink-800">Ahmad Fauzi</dd>
                </div>
                <div className="flex justify-between border-b border-dashed border-ink-100 pb-2">
                  <dt className="text-ink-400">Kelas</dt>
                  <dd className="font-medium text-ink-800">X-1</dd>
                </div>
                <div className="flex justify-between border-b border-dashed border-ink-100 pb-2">
                  <dt className="text-ink-400">Alasan</dt>
                  <dd className="font-medium text-ink-800">Ke toilet</dd>
                </div>
                <div className="flex justify-between border-b border-dashed border-ink-100 pb-2">
                  <dt className="text-ink-400">Waktu Keluar</dt>
                  <dd className="font-mono font-medium text-ink-800">09.14</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-400">Waktu Masuk</dt>
                  <dd className="font-mono font-medium text-ink-800">09.26</dd>
                </div>
              </dl>

              {/* Stempel */}
              <div className="stamp absolute -right-5 -top-5 h-20 w-20 text-[11px] shadow-card">
                Tertib
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ALUR KERJA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Bagaimana SI TERTIB bekerja?</h2>
          <p className="mt-3 text-ink-400">
            Tiga hal utama, dari siswa keluar kelas sampai guru melihat rekapnya.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              no: '01',
              icon: ClipboardList,
              title: 'Isi Identitas',
              desc: 'Siapa saja bisa mencatat waktu keluar, waktu masuk, dan alasan siswa langsung dari halaman ini — tanpa perlu login.',
              to: '/isi-identitas',
            },
            {
              no: '02',
              icon: BarChart3,
              title: 'Data Siswa',
              desc: 'Guru yang sudah login dapat melihat rekap dan persentase seberapa sering setiap siswa keluar kelas dalam sehari.',
              to: '/data-siswa',
            },
            {
              no: '03',
              icon: History,
              title: 'Riwayat Catatan',
              desc: 'Semua input dari berbagai pengguna terekam dalam satu riwayat yang bisa dicari dan difilter per kelas atau tanggal.',
              to: '/riwayat',
            },
          ].map((step) => (
            <Link key={step.no} to={step.to} className="card p-6 transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-2xl font-bold text-ink-100">{step.no}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-800">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{step.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ MANFAAT ============ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">Kenapa pakai SI TERTIB?</h2>
              <ul className="mt-6 space-y-4">
                {[
                  'Data keluar-masuk siswa tersimpan rapi & mudah dicari kembali.',
                  'Guru bisa langsung melihat siswa yang paling sering keluar kelas.',
                  'Tidak perlu lagi buku catatan fisik yang mudah hilang atau rusak.',
                  'Akses Data Siswa dan Riwayat dilindungi login, hanya untuk guru sekolah.',
                ].map((text) => (
                  <li key={text} className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm leading-relaxed text-ink-700">{text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/tentang"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-800 hover:text-brass-600"
              >
                Pelajari lebih lanjut tentang SI TERTIB <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="card bg-ink-800 p-8 text-white">
              <BarChart3 className="h-8 w-8 text-brass-400" />
              <p className="mt-4 font-display text-2xl font-semibold">
                Pantau ketertiban kelas dalam satu halaman.
              </p>
              <p className="mt-2 text-sm text-ink-100/70">
                Persentase keluar kelas per siswa dihitung otomatis setiap hari,
                membantu guru mengambil tindakan lebih cepat.
              </p>
              <Link to="/login" className="btn-accent mt-6">
                Masuk sebagai Guru <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
