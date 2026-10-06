# Aktivasi analytics dan deployment Vercel

## Status paket

Kode sudah mencakup React, API pencatatan, cron harian, dan pengiriman email.
Paket ini BELUM berarti akun hosting/database/email sudah dikonfigurasi atau email sudah terkirim.
Penerima sudah tetap: habibdani86@gmail.com. Laporan memakai kalender Asia/Jakarta.

## 1. Jalankan lokal

Extract ZIP, buka terminal pada folder `habib-portfolio-react`:

```bash
npm install
npm run dev
```

Perintah ini menjalankan UI. Analytics lokal mati secara default supaya percobaan desain tidak tercatat.
Untuk simulasi Vercel Functions gunakan `npx vercel dev` setelah link proyek dan konfigurasi `.env.local`.
Aktifkan kedua flag lokal di `.env.example` hanya jika sengaja menguji dengan database pengujian,
dan sesuaikan SITE_URL dengan origin lokal yang ditampilkan CLI.
Cron otomatis hanya berjalan di deployment Production; Vercel dev tidak menjadwalkan cron.

## 2. Siapkan Upstash Redis

- Buka https://console.upstash.com/ dan buat database Redis khusus portofolio ini.
- Pilih paket yang sesuai setelah memeriksa harga/kuota yang tampil; kode tidak mengaktifkan paket berbayar.
- Ambil `UPSTASH_REDIS_REST_URL` dan token REST read/write (`UPSTASH_REDIS_REST_TOKEN`).
- Gunakan token read/write, bukan read-only. Simpan sebagai secret backend Vercel, bukan kode frontend.
- Gunakan database khusus untuk proyek ini karena namespace penyimpanan `portfolio:` digunakan oleh kode.

## 3. Siapkan Resend

- Buka https://resend.com/ dan buat API key untuk pengiriman email.
- Jika akun Resend terdaftar sebagai habibdani86@gmail.com, sender testing `Portfolio <onboarding@resend.dev>`
  dapat digunakan untuk mengirim ke alamat pemilik akun tersebut.
- Jika akun memakai email lain, atau untuk sender production, verifikasi domain milikmu di Resend.
  Lalu gunakan REPORT_FROM seperti `Portfolio <laporan@domain-terverifikasi.com>`.
- Jangan menggunakan `habibdani86@gmail.com` sebagai alamat FROM di Resend tanpa domain yang dapat diverifikasi.
  Alamat Gmail ini adalah penerima.
- Simpan API key sebagai `RESEND_API_KEY` di Vercel. Jangan kirim API key melalui chat.

## 4. Buat dua secret berbeda

Jalankan perintah ini dua kali di terminal komputermu:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Gunakan hasil pertama untuk `CRON_SECRET`, hasil kedua untuk `ANALYTICS_HASH_SECRET`.
Jangan masukkan hasilnya ke Git atau ZIP.

## 5. Buat/import proyek Vercel

Pilihan GitHub:
1. Upload source ini ke repository GitHub milikmu. Jangan upload node_modules, dist, atau .env.local.
2. Di Vercel, import repository tersebut sebagai proyek baru untuk portofolio, bukan proyek company profile.
3. Root Directory: folder yang berisi package.json.
4. Framework: Vite. Build: npm run build. Output: dist.

Pilihan CLI dari folder proyek:

```bash
npx vercel login
npx vercel link
```

Pilih akun/team yang benar dan proyek portofolio. Jangan memilih proyek Khalief TechCraft yang sudah ada.

## 6. Environment Variables di Vercel (Production)

| Nama | Isi |
|---|---|
| SITE_URL | Origin final portofolio, misalnya https://nama-proyek.vercel.app, tanpa path |
| UPSTASH_REDIS_REST_URL | REST URL database |
| UPSTASH_REDIS_REST_TOKEN | Token read/write database |
| RESEND_API_KEY | API key Resend |
| REPORT_FROM | Sender Resend yang diizinkan |
| CRON_SECRET | Secret acak pertama, minimal 32 karakter |
| ANALYTICS_HASH_SECRET | Secret acak kedua, minimal 32 karakter |

`VERCEL` dan `VERCEL_ENV` disediakan otomatis oleh Vercel. Tidak perlu ditambahkan manual.
Jangan memberi awalan VITE_ pada secret. Flag lokal dibiarkan false/tidak dipasang di Vercel.
SITE_URL harus sama persis dengan domain yang kamu bagikan. Jika domain berubah, ubah SITE_URL lalu redeploy.

Setelah semua nilai disimpan, deploy Production:

```bash
npx vercel --prod
```

Atau gunakan deployment GitHub yang terhubung. Perubahan environment memerlukan redeploy.

## 7. Validasi setelah deploy

1. Buka situs production dari browser biasa, dengan Do Not Track/GPC tidak aktif dan tidak memilih opt-out.
2. DevTools > Network: `POST /api/track` seharusnya memberi 200 dengan `status: recorded`.
3. Periksa database khusus portofolio: key `portfolio:YYYY-MM-DD:events` berisi event hari ini (tanggal WIB).
4. Endpoint `/api/daily-report` tanpa token harus memberi 401. Ini disengaja.
5. Untuk cek laporan privat, salin `.env.example` menjadi `.env.local` pada komputer sendiri dan isi SITE_URL serta CRON_SECRET.

```bash
npm run check:report
```

Perintah di atas hanya menampilkan ringkasan kemarin, tanpa mengirim email.
Untuk mengirim laporan kemarin satu kali:

```bash
npm run check:report -- --send
```

Laporan pertama boleh berisi nol jika situs baru aktif hari ini. Kunjungan hari ini masuk laporan BESOK.
Hasil `accepted_by_email_provider` berarti Resend menerima permintaan, bukan bukti email masuk inbox.
Periksa inbox/spam penerima dan log delivery Resend untuk konfirmasi.

## 8. Jadwal dan pengiriman ulang

`vercel.json` memuat `0 1 * * *` (01.00 UTC = 08.00 WIB), dengan rentang laporan 00.00–23.59 hari sebelumnya.
Pada Vercel Hobby, pemanggilan dapat terjadi dalam rentang 08.00–08.59 WIB.
Periksa Settings > Cron Jobs sesudah deployment Production.
Vercel tidak otomatis mencoba ulang cron yang gagal. Jika suatu hari gagal, periksa logs dan jalankan ulang:

```bash
npm run check:report -- --send 2026-10-06
```

Tanggal harus sudah selesai dalam WIB dan masih dalam 29 hari terakhir.
Jika email sudah sukses diproses, endpoint mengembalikan already_sent.
Saat respons email ambigu (misalnya timeout), payload disimpan dan retry menggunakan Idempotency-Key yang sama.
Retry otomatis ditolak setelah 23 jam sejak payload awal untuk mencegah duplikasi setelah masa idempotency Resend.
Untuk kasus ini periksa logs Resend: jika email diterima, tandai key `portfolio:TANGGAL:sent` secara manual;
kalau dipastikan belum diterima, hapus hanya key `portfolio:TANGGAL:report-payload` dan jalankan ulang.
Jangan menghapus marker sent untuk sekadar mencoba ulang.

## Data dan batasan

- Pengumpulan otomatis; tidak meminta nama/email/login kepada pengunjung.
- Halaman /, waktu server, domain perujuk, negara/kota perkiraan, kategori browser/perangkat, dan klik CV/kontak.
- ID perkiraan berasal dari HMAC IP + user-agent + tanggal WIB dengan secret; IP dan user-agent mentah tidak disimpan oleh aplikasi.
- ID berubah setiap hari. Dua orang di jaringan yang sama dengan browser identik bisa tergabung;
  satu orang yang berganti IP/browser bisa dihitung berbeda. Bukan nama atau identitas orang.
- Tidak mengirim query URL, path referrer, koordinat, atau cookie identitas.
- Hormati Do Not Track, Global Privacy Control, serta opt-out di footer.
- Filter bot dasar, 30 event per menit per ID harian, maksimum 5.000 event tersimpan per hari.
  Ini pembatas aplikasi, bukan jaminan menahan semua bot atau abuse; pemanggilan function tetap memakai kuota Vercel.
- Data event dan payload laporan memiliki TTL 30 hari. Marker pengiriman hanya berisi ID email/waktu dan bertahan 90 hari.
  Salinan CSV/email dalam inbox serta log penyedia mengikuti retensi masing-masing layanan.
- Sampai kredensial tersedia, fitur belum aktif. Kesalahan analytics tidak memblokir tampilan portofolio.

## Pengujian paket

```bash
npm test
npm run build
```

Tes mencakup batas tanggal WIB, pembersihan data, hitungan, keamanan endpoint, CSV/HTML escaping,
pencegahan email ganda, dan retry dengan payload yang sama. Redis/Resend dimock dalam tes;
validasi live tetap diperlukan setelah akun terhubung.

Referensi resmi:
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://upstash.com/docs/redis/features/restapi
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/api-reference/errors
