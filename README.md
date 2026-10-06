# Muhammad Alhamdani — React Portfolio

Website portofolio React + Vite, JavaScript (.jsx), CSS biasa.
UI dapat dijalankan lokal tanpa API key. Fitur analytics/email menggunakan backend Vercel Functions + Upstash Redis + Resend. Lihat DEPLOY-VERCEL.md untuk aktivasi.

## Mulai di komputer kamu

1. Extract ZIP, lalu buka folder `habib-portfolio-react` di VS Code.
2. Buka Terminal di folder yang berisi `package.json`.
3. Gunakan Node.js versi 22.13+ (Node 24/26 juga memenuhi persyaratan).
4. Jalankan:

```bash
npm install
npm run dev
```

Buka alamat Local yang ditampilkan terminal (biasanya http://localhost:5173).
Jangan membuka index.html dengan klik dua kali. Hentikan server dengan Ctrl+C.

## Cek versi production

```bash
npm run build
npm run preview
```

Output build berada di `dist/`. `npm run preview` biasanya berjalan di http://localhost:4173.

## Deploy ke Vercel nanti

Push folder proyek ini ke repository GitHub, kemudian import repository di Vercel.
Pengaturan proyek yang disertakan:
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

Pilih folder yang berisi package.json sebagai Root Directory. Untuk analytics/email, lengkapi environment variables pada DEPLOY-VERCEL.md.

## Struktur dan edit

- `src/App.jsx`: profil, kontak, bahasa EN/ID, daftar proyek dan pengalaman.
- `src/styles.css`: warna, layout responsif, tema gelap, dan animasi.
- `src/usePortfolioMotion.js`: reveal saat scroll, active navigation, progress scroll, dan pointer spotlight.
- `src/main.jsx`: entry React.
- `public/profile.jpg`: foto profil.
- `public/Muhammad-Alhamdani-CV.pdf`: CV yang diunduh pengunjung.
- `public/favicon.svg`: ikon tab browser.
- `index.html`: judul dan metadata.

Bahasa default Inggris dan tema default terang. Pilihan berikutnya disimpan lokal pada browser.
Nomor WhatsApp mengikuti CV: +62 81336454735. Periksa isi dan kontak sebelum dipublikasikan.
Deskripsi proyek bersumber dari CV; tidak menampilkan screenshot atau demo proyek yang belum disediakan.

## Animasi

- Hero masuk bertahap dan warna judul bergerak.
- Latar biru lembut, bingkai foto bergerak, serta badge mengambang.
- Reveal section ketika scroll dan hover kartu dengan spotlight mengikuti pointer.
- Garis navigasi aktif, progress bar, tombol kembali ke atas, dan detail proyek yang dapat dibuka.
- Ring dekoratif pada bagian kontak dan feedback hover tombol/keahlian.
- Mendukung `prefers-reduced-motion`; efek pointer hanya pada perangkat dengan mouse.

Source tidak menyertakan node_modules, kredensial, atau konfigurasi hosting ChatGPT.

## Versi 3 — laporan kunjungan otomatis

Pencatatan tanpa form, email harian ke habibdani86@gmail.com, dan lampiran CSV.
Backend berada di api/ dan server/, tracking frontend di src/analytics.js.
Baca DEPLOY-VERCEL.md sebelum production. Secret contoh ada di .env.example.
