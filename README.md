# NgopiMalang

Direktori rekomendasi coffee shop di Kota Malang. Website ini tetap di-host di GitHub Pages; Supabase menjadi database bersama untuk data website.

## Menjalankan pratinjau

Jalankan `Jalankan website.bat`, lalu buka http://localhost:8000.

## Menyiapkan Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard), masuk atau buat akun.
2. Pilih **New project**, pilih organisasi, isi nama `NgopiMalang`, buat database password yang kuat, pilih region terdekat yang tersedia, lalu tekan **Create new project**. Simpan password database di password manager; password itu tidak perlu dikirim ke Codex.
3. Setelah project selesai dibuat, buka **SQL Editor → New query**. Salin seluruh isi `supabase/schema.sql`, tekan **Run**, dan pastikan query selesai tanpa error.
4. Buat query baru, salin seluruh isi `supabase/public-features.sql`, tekan **Run** untuk mengaktifkan ringkasan keramaian publik, penyimpanan foto, filter fasilitas, dan pembaruan langsung untuk konten publik.
5. Buka **Project Settings → API**. Salin **Project URL** dan **Publishable key** (pada project lama mungkin disebut `anon` key). Masukkan keduanya ke `supabase-config.js`.
6. Buat akun admin di **Authentication → Users → Add user**. Setelah user dibuat, salin UUID user itu dan jalankan di SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('UUID-USER-ADMIN');
   ```

   Hanya UUID yang terdaftar di `admin_users` yang boleh mengelola data melalui kebijakan database.

### Kunci yang aman untuk website

`Project URL` dan `Publishable key` (atau `anon` key lama) memang dipakai di browser. Keamanan data berasal dari Row Level Security (RLS) yang sudah diaktifkan dalam skema. **Jangan masukkan `service_role` key, database password, atau access token ke file website atau GitHub.**

## Fitur yang memakai Supabase

- Direktori, detail kedai, pencarian, filter area/harga/fasilitas, rating, favorit, dan artikel terbit dibaca dari Supabase. Perubahan konten publik disinkronkan saat itu juga; ringkasan laporan keramaian diperbarui berkala.
- Admin dapat menambah/mengubah kedai, artikel dan status publikasi, memoderasi ulasan, request tempat, koreksi, laporan keramaian, serta mengunggah foto.
- Form usulan tempat, ulasan, koreksi, dan laporan keramaian menyimpan kiriman ke Supabase. Laporan keramaian adalah masukan sukarela dan diringkas untuk dua jam terakhir; website tidak membaca sinyal HP pengunjung.
- Pengunjung dapat mendaftar/masuk melalui halaman akun Supabase untuk mengirim ulasan; email confirmation dan URL redirect diatur dari Authentication → URL Configuration.
- Form admin menyediakan alamat lengkap, rentang harga, jam operasional, dan pilihan fasilitas yang langsung mengendalikan filter publik (nugas, malam, outdoor, hemat, Wi-Fi, dan stopkontak).
- Foto disimpan di Supabase Storage. Aturan publikasi dan akses diatur oleh RLS pada database dan kebijakan bucket.
- Favorit disimpan di browser pengunjung karena bersifat personal.

Peta menampilkan pin ketika admin mengisi latitude dan longitude untuk kedai. Jika belum ada koordinat, pengunjung tetap dapat membuka pencarian lokasi kedai melalui Google Maps.
