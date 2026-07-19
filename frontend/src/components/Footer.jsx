export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <img src="/assets/logo-sekolah.png" alt="Logo Perguruan Dharma Bakti Lubuk Pakam" className="h-8 w-8 object-contain" />
            <span className="stamp h-8 w-8 text-[8px]">T</span>
            <span className="font-display font-semibold text-ink-800">SI TERTIB</span>
          </div>
          <p className="text-center text-sm text-ink-400">
            © {new Date().getFullYear()} SI TERTIB — Sistem Informasi Tertib Kehadiran Siswa.
          </p>
        </div>
      </div>
    </footer>
  );
}
