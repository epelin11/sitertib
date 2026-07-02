import { BookOpen, Cog, Target, Users } from "lucide-react";

/**
 * Halaman "Tentang" ini berisi konten contoh/placeholder.
 * Silakan ubah teks di bawah (judul, paragraf, dan daftar) sesuai
 * kebutuhan dan kebijakan sekolah Anda masing-masing.
 */
export default function Tentang() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <span className="text-xs font-semibold uppercase tracking-widest text-brass-600">
        Tentang
      </span>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Tentang SI TERTIB</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-600">
        Halaman ini menjelaskan apa itu SI TERTIB, bagaimana sistemnya bekerja,
        dan tujuan penggunaannya di sekolah. Silakan sunting konten di bawah ini
        sesuai kebijakan dan kebutuhan sekolah Anda.
      </p>

      {/* ---- Apa itu SI TERTIB ---- */}
      <section className="mt-10 flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink-800">Apa itu SI TERTIB?</h2>
          <p className="mt-2 leading-relaxed text-ink-600">
            SI TERTIB (Sistem Informasi Tertib) adalah aplikasi pencatatan
            digital untuk memantau siswa yang keluar dan masuk kelas pada jam
            pelajaran. Setiap siswa yang keluar kelas mengisi data diri,
            alasan, serta waktu keluar dan masuk melalui halaman{" "}
            <span className="font-medium text-ink-800">Isi Identitas</span>,
            sehingga guru dapat memantau aktivitas tersebut secara real-time.
          </p>
        </div>
      </section>

      {/* ---- Bagaimana sistemnya bekerja ---- */}
      <section className="mt-8 flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
          <Cog className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink-800">Bagaimana sistem ini bekerja?</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 leading-relaxed text-ink-600">
            <li>
              Siswa yang ingin keluar kelas mengisi formulir pada menu{" "}
              <span className="font-medium text-ink-800">Isi Identitas</span>{" "}
              (nama, NISN, kelas, jenis kelamin, dan alasan keluar).
            </li>
            <li>Waktu keluar tercatat otomatis oleh sistem saat formulir dikirim.</li>
            <li>
              Ketika siswa kembali, mereka mengisi NISN pada formulir yang sama
              untuk mencatat waktu masuk.
            </li>
            <li>
              Guru yang sudah login dapat melihat rekap seluruh data pada menu{" "}
              <span className="font-medium text-ink-800">Data Siswa</span>,
              termasuk persentase keluar kelas tiap siswa per hari.
            </li>
          </ol>
        </div>
      </section>

      {/* ---- Tujuan & manfaat ---- */}
      <section className="mt-8 flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink-800">Tujuan & manfaat</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
            <li>Membantu sekolah menjaga ketertiban siswa selama jam pelajaran.</li>
            <li>Menggantikan buku catatan manual dengan data digital yang lebih rapi.</li>
            <li>Memudahkan guru BK/wali kelas memantau siswa yang sering keluar kelas.</li>
            <li>Menjadi bahan evaluasi dan pembinaan kedisiplinan siswa.</li>
          </ul>
        </div>
      </section>

      {/* ---- Untuk siapa ---- */}
      <section className="mt-8 flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-800">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink-800">Untuk siapa SI TERTIB?</h2>
          <p className="mt-2 leading-relaxed text-ink-600">
            Sistem ini digunakan oleh seluruh siswa (untuk mengisi data keluar
            masuk kelas) dan guru/staf sekolah (untuk memantau data tersebut
            melalui akun yang sudah didaftarkan oleh pihak sekolah).
          </p>
        </div>
      </section>
    </div>
  );
}
