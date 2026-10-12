# NgopiMalang

Direktori rekomendasi coffee shop di Kota Malang. Website ini tetap di-host di GitHub Pages; Supabase menjadi database bersama untuk data website.

## Menjalankan pratinjau

Jalankan `Jalankan website.bat`, lalu buka http://localhost:8000.

## Menyiapkan Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard), masuk atau buat akun.
2. Pilih **New project**, pilih organisasi, isi nama `NgopiMalang`, buat database password yang kuat, pilih region terdekat yang tersedia, lalu tekan **Create new project**. Simpan password database di password manager; password itu tidak perlu dikirim ke Codex.
3. Setelah project selesai dibuat, buka **SQL Editor → New query**. Salin seluruh isi `supabase/schema.sql`, tekan **Run**, dan pastikan query selesai tanpa error.
4. Buka **Project Settings → API**. Salin **Project URL** dan **Publishable key** (pada project lama mungkin disebut `anon` key). Masukkan keduanya ke `supabase-config.js`, menggantikan nilai contoh.
5. Tambahkan kedua nilai yang sama ke konfigurasi website, lalu deploy file website ke GitHub Pages.
6. Buat akun admin di **Authentication → Users → Add user**. Setelah user dibuat, salin UUID user itu dan jalankan di SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('UUID-USER-ADMIN');
   ```

   Hanya UUID yang terdaftar di `admin_users` yang boleh mengelola data melalui kebijakan database.

### Kunci yang aman untuk website

`Project URL` dan `Publishable key` (atau `anon` key lama) memang dipakai di browser. Keamanan data berasal dari Row Level Security (RLS) yang sudah diaktifkan dalam skema. **Jangan masukkan `service_role` key, database password, atau access token ke file website atau GitHub.**

## Apa yang tersambung saat ini

- Form usulan tempat, laporan keramaian, dan koreksi informasi mengirim ke Supabase ketika URL dan key sudah diisi.
- Jika Supabase belum dikonfigurasi, website mempertahankan mode pratinjau lokal menggunakan browser storage.
- SQL menyiapkan tabel kedai, artikel, foto, ulasan, request, laporan keramaian, koreksi, dan daftar admin beserta aturan aksesnya.
- Panel admin saat ini masih prototipe lokal. Login admin, pengelolaan data langsung ke Supabase, upload foto ke Storage, dan render kedai/artikel dari tabel database perlu disambungkan setelah project Supabase dan akun admin tersedia.
- Data keramaian berasal dari laporan sukarela pengunjung. Supabase menyimpan waktu dan pilihan sepi/sedang/ramai; website tidak membaca sinyal HP pengunjung.

## Catatan data contoh

Informasi kedai, rating, harga, jam buka, foto, dan statistik contoh di halaman sekarang belum diverifikasi. Periksa sebelum dijadikan informasi publik.

