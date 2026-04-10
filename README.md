# Belajar Vibe Coding (Backend API)

Proyek ini adalah backend service sederhana yang dibangun menggunakan pendekatan modern. Aplikasi ini bertindak sebagai penyedia *Application Programming Interface* (API) untuk mendukung fitur manajemen pengguna dasar, yang terdiri dari proses pendaftaran akun (registrasi), otentikasi (login), pengecekan profil terkini, hingga manajemen pemutusan sesi (logout).

---

## 🛠️ Technology Stack & Libraries

Proyek ini mengadopsi stack berbasis **TypeScript** dengan memprioritaskan kecepatan komputasi dari proses *running*, *testing*, dan stabilitas tipe perputaran data (type safety). 

- **[Bun](https://bun.sh/)** - Komponen Runtime JavaScript tercepat sekaligus digunakan sebagai *package manager* bawaan dan eksekutor *test runner*.
- **[ElysiaJS](https://elysiajs.com/)** - *Web framework* backend yang amat cepat dan ringan, dan memiliki dukungan penuh dari TypeScript & TypeBox untuk validasi rute.
- **[Drizzle ORM](https://orm.drizzle.team/)** - Relational Mapper (ORM) modern, aman untuk varian tipe data untuk manipulasi skema dan relasi MySQL secara presisi.
- **MySQL** - Relational Database Management System yang digunakan pada mesin penyimpanan (memanfaatkan `mysql2` sebagai *driver-core*).
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Library tangguh dan standar industri untuk digunakan melakukan *Hashing/Encryption* pada data kritikal seperti password pengguna.

---

## 🏗️ Arsitektur & Struktur Folder

Aplikasi ini menggunakan pola **Service-Oriented Architecture** yang bersih dan dirancang untuk skalabilitas. Logika validasi permintaan masuk dan HTTP (*Route*) dipisahkan secara ketat dari logika algoritma basis datanya (*Service/Controller*).

Basis kode proyek juga menetapkan konvensi penggunaan penamaan file berdasarkan tipe `kebab-case` (contoh: `users-route.ts`, `users.test.ts`).

### Hierarki Skema Folder:
```text
belajar-vibe-coding/
├── src/                  # Folder Kode Utama (Source)
│   ├── db/               # Inisiasi konektivitas & Skema relasi database (Drizzle)
│   │   ├── index.ts        
│   │   └── schema.ts       
│   ├── routes/           # Layer routing (Pendelegasian HTTP Layer & Validasi payload)
│   │   └── users-route.ts  
│   ├── services/         # Layer operasi inti (Akses skema Database & Autentikasi)
│   │   └── users-service.ts
│   └── index.ts          # Root Entry Point untuk inisialisasi Server Elysia App
├── test/                 # Kumpulan kerangka kode pengujian Unit Test (bun test)
│   ├── app.test.ts
│   └── users.test.ts
├── .env                  # Variabel Environment lokal (Kredensial database)
├── drizzle.config.ts     # Konfigurasi manajemen schema drizzle
└── package.json          # File konfigurasi utama Project
```

---

## 🗄️ Schema Database

Skema tabel diatur dan dibangun murni dari file `src/db/schema.ts` melalui dukungan Drizzle `mysql-core`, terdiri dari:

1. Tabel **`users`**
   - Berfungsi melist kredensial dan riwayat pemilik akun.
   - Variasi Kolom: `id` *(serial PK)*, `name` *(varchar 255)*, `email` *(varchar 255, **unique**)*, `password` *(varchar 255/Hashed)*, `createdAt` *(timestamp)*.
2. Tabel **`sessions`**
   - Bertujuan menyimpan ID sesi unik secara tertutup yang dikelola ketika pengguna memanggil API Login. Sesi akan hangus secara otomatis sesuai patokan masa berlakunya.
   - Variasi Kolom: `id` *(serial)*, `token` *(varchar 255 / Bearer UUID)*, `userId` *(Foreign Key, merujuk ke users.id)*, `createdAt` *(timestamp)*, `expiredAt` *(timestamp, target mati).*
3. Tabel **`test_connection`**
   - Tabel dummy bawaan sebagai utilitas cek konektivitas ORM lokal.
   - Variasi Kolom: `id` *(serial)*, `message` *(text)*, `createdAt` *(timestamp)*.

---

## 📡 Daftar API yang Tersedia

### 1. Utility APIs
- **`GET /`** : Endpoint utilitas untuk memeriksa responsibilitias server dengan teks kembalian `"Hello World dari Elysia & Bun!"`.
- **`GET /test-db`** : Endpoint uji coba dan *mock response* koneksi instans DB berjalan (Mencoba proses Insert dan Select).

### 2. User API (Root Prefix `api/users/`)
- **`POST /` (Mendaftarkan Akun/Register)**
  - Menerima muatan format JSON: `{ name, email, password }`. Payload akan di-verifikasi melalui batas maksimal panjang huruf *(max 255 karakter)* serta menelaah standar pola email yang benar. Melemparkan pendaftaran dan kata sandi bertopeng/hash ke basis tabel database.
- **`POST /login` (Masuk Akun/Login)**
  - Diwajibkan mengirimkan JSON: `{ email, password }`. Berperan untuk mencocokan autentikator data, serta akan mengembalikan bentuk String UUID panjang (*Token*) jika data dikenali.
- **`GET /current` (Ambil Profil Aktif Terkini)**
  - **Syarat Headers:** Wajib menyertakan Header API -> `Authorization: Bearer <String_UUID>`
  - Berfungsi melacak akun berbekal string UUID token, jika tidak kedaluwarsa akan menghasilkan output utuh dari tabel profil utama sang pemilik sesi.
- **`DELETE /logout` (Akhiri Session/Logout)**
  - **Syarat Headers:** Wajib menyertakan Header API -> `Authorization: Bearer <String_UUID>`
  - Segera memutuskan atau mereset hak akses token pengguna di dalam ruang database.

---

## 🚀 Cara Setup Project (Clone & Instalasi)

Untuk menghidupkan proyek ini di ruang kerja Anda sendiri, terapkan langkah instruksi di bawah ini:

1. Anda harus menginstall framework runtime **Bun** pada OS Anda, di samping perantara eksekusi native **MySQL**.
2. Download Repositori ke direktori tujuan dan masuk ke dalam scope pengerjaan tersebut:
   ```bash
   git clone https://github.com/kanezadjorda/belajar-vibe-coding.git
   cd belajar-vibe-coding
   ```
3. Distribusikan file konfigurasi Environtment Variable (`.env`). Pastikan parameter seperti `DB_USER` dan baris `DATABASE_URL` disesuaikan dengan status kredensial MySQL lokal Anda.
   ```bash
   cp .env.example .env
   ```
4. Pasang pustaka Dependencies pihak ke tiga (*Installation Phase*):
   ```bash
   bun install
   ```
5. *(Opsional: Ingatlah melontarkan migrasi atau sinkronisasi struktur ke Drizzle `bunx drizzle-kit push` pada command promt agar arsitektur DB mysql diperbarui).*

---

## ▶️ Cara Run Aplikasi

Anda siap menyalakan backend secara cepat tanpa parameter ribet! Cukup panggil CLI utama:

```bash
bun run src/index.ts
```
> Bun akan menjalankan service di latar belakang dan aplikasi API murni siap merespons secara langsung melalui *port*: `http://localhost:3000`.

---

## 🧪 Cara Test Aplikasi

Ekosistem backend ini turut dikemas dengan perlindungan **Unit Testing** pada lapis rute dan controller. Kami menerapkan penataan file di modul `bun:test` dengan menyematkan komponen *mock module*, yang dengan praktis mencegah mutasi ke database fisik alias benar-benar statis.

Silakan buktikan 100% lulus skenario pengembangannya (sebanyak dua level pengetesan module dan >12 Test Cases):
```bash
bun test
```
