# Pendaftaran Reuni Akbar Alumni SMA Islam Al-Mizan

Situs statis (HTML/CSS/JS) untuk GitHub Pages. Data pendaftar tersimpan di Google Sheets milik Anda melalui Google Apps Script. Semuanya gratis dan tanpa server.

## Isi proyek

| Berkas | Fungsi |
| --- | --- |
| `index.html` | Halaman dan formulir pendaftaran |
| `script.js` | Validasi, pengiriman data, dan halaman sukses |
| `config.js` | **Satu-satunya berkas yang perlu Anda ubah** (tanggal, tempat, kontak, URL Apps Script) |
| `apps-script/Code.gs` | Kode backend yang ditempel ke Google Apps Script |

## Langkah 1 — Siapkan Google Sheets dan Apps Script

1. Buka <https://sheets.new>, beri nama "Pendaftar Reuni Al-Mizan".
2. Menu **Ekstensi → Apps Script**. Hapus isi default, lalu tempel seluruh isi `apps-script/Code.gs`. Simpan.
3. Klik **Terapkan (Deploy) → Deployment baru**, jenis **Aplikasi web**:
   - *Jalankan sebagai*: **Saya**
   - *Yang memiliki akses*: **Siapa saja**
4. Klik **Terapkan**, setujui izin akses, lalu salin **URL aplikasi web** (berakhiran `/exec`).

Sheet bernama `Pendaftar` dibuat otomatis saat pendaftar pertama masuk. Spreadsheet tetap privat; pengunjung situs hanya bisa mengirim data dan melihat jumlah total peserta.

> Setiap kali Anda mengubah `Code.gs`, buat **Deployment baru / kelola deployment → versi baru** agar perubahan berlaku. URL `/exec` tetap sama jika Anda mengedit deployment yang ada.

## Langkah 2 — Isi `config.js`

Isi `tanggal`, `waktu`, `tempat`, `kontakPanitiaWA` (format `628…`), `linkGrupWA`, `biayaInfo` bila ada, dan tempel URL dari Langkah 1 pada `apiUrl`.

## Langkah 3 — Pasang di GitHub Pages

```bash
git init
git add .
git commit -m "Situs pendaftaran reuni"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Lalu di GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**. Dalam 1–2 menit, tautan pendaftaran aktif di:

`https://USERNAME.github.io/NAMA-REPO/`

Bagikan tautan itu ke grup alumni. Anda juga dapat memakai domain sendiri lewat pengaturan Pages.

## Uji sebelum dibagikan

1. Buka tautan, isi formulir dengan data uji, lalu kirim.
2. Pastikan baris baru muncul di sheet `Pendaftar` dan kode `REUNI-0001` tampil di layar.
3. Kirim ulang dengan nomor WhatsApp yang sama: seharusnya muncul pesan "sudah terdaftar".
4. Hapus baris uji di sheet (sisakan header).

## Fitur

- Validasi nomor WhatsApp (otomatis diubah ke format 62…) dan email.
- Kode pendaftaran unik, serta pencegahan pendaftaran ganda berdasarkan nomor WhatsApp.
- Jumlah peserta, ukuran kaos, kesediaan jadi panitia/donatur, dan persetujuan penggunaan data.
- Perlindungan dasar: kolom jebakan bot, kunci antrean saat banyak pendaftar bersamaan, dan penetralan rumus berbahaya di Sheets.
- Kolom `Status Bayar` di sheet (default "Belum") untuk Anda perbarui manual.

## Catatan privasi

Data berisi nama dan nomor WhatsApp alumni. Jangan membagikan akses spreadsheet kepada orang yang tidak berkepentingan, dan gunakan data hanya untuk keperluan reuni sesuai persetujuan pada formulir.
