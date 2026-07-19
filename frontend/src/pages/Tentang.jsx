import { ClipboardList, Workflow, Info } from 'lucide-react';

export default function Tentang() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-ink-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-600">
        Tentang
      </span>
      <h1 className="mt-4 text-4xl font-bold">Apa itu SI TERTIB?</h1>

      {/*
        Catatan: konten di bawah ini adalah teks contoh (placeholder).
        Silakan ganti langsung sesuai kebutuhan sekolah Anda —
        cari komentar "EDIT DI SINI" untuk menemukan bagian yang perlu diubah.
      */}

      <div className="mt-10 space-y-6">
        <section className="card p-7">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-ink-800">Apa itu SI TERTIB</h2>
          </div>
          {/* EDIT DI SINI: deskripsi singkat sekolah/latar belakang aplikasi */}
          <p className="leading-relaxed text-ink-600">
            SI TERTIB (Sistem Informasi Tertib) adalah aplikasi pencatatan siswa yang izin
            keluar-masuk kelas selama jam pelajaran. Tuliskan di sini latar belakang, tujuan,
            dan manfaat aplikasi ini bagi sekolah Anda.
          </p>
        </section>

        <section className="card p-7">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
              <Workflow className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-ink-800">Bagaimana Sistemnya Bekerja</h2>
          </div>
          {/* EDIT DI SINI: jelaskan alur sistem sesuai kebijakan sekolah */}
          <ol className="list-inside list-decimal space-y-3 leading-relaxed text-ink-600">
            <li>Siswa atau petugas piket mengisi form pada halaman <strong className="text-ink-800">Isi Identitas</strong> saat siswa izin keluar kelas.</li>
            <li>Sistem mencatat waktu keluar, waktu masuk, kelas, dan alasan secara otomatis.</li>
            <li>Guru login untuk melihat rekap dan persentase kehadiran pada halaman <strong className="text-ink-800">Data Siswa</strong>.</li>
            <li>Seluruh catatan dapat ditelusuri kembali melalui halaman <strong className="text-ink-800">Riwayat</strong>.</li>
          </ol>
        </section>

        <section className="card p-7">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-ink-800">Dan Lain Sebagainya</h2>
          </div>
          {/* EDIT DI SINI: tambahkan info lain seperti kontak, kebijakan privasi, dsb */}
          <p className="leading-relaxed text-ink-600">
            Tambahkan informasi lain di sini, misalnya kontak tata usaha, jam operasional,
            atau kebijakan sekolah terkait izin keluar kelas.
          </p>
        </section>
      </div>
    </div>
  );
}
