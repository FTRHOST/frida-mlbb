# Bedah Kode: Memahami Frida & Il2Cpp untuk Pemula

Selamat datang di panduan pemula untuk script modding ini! Di sini, kita akan membedah bagaimana kode di dalam folder `src/` bekerja dengan bahasa yang sederhana. Jangan khawatir jika melihat banyak kode teknis, kita akan bahas pelan-pelan.

## 1. Konsep Dasar yang Perlu Kamu Tahu

Sebelum masuk ke kode, mari pahami tiga tokoh utama dalam permainan ini:

*   **Frida**: Ini adalah "jarum suntik" kita. Frida memungkinkan kita memasukkan kode JavaScript milik kita sendiri ke dalam aplikasi/game orang lain yang sedang berjalan.
*   **Unity & Il2Cpp**: Dulu, game Unity menggunakan bahasa C# dan langsung dijalankan. Sekarang, untuk keamanan dan performa, Unity mengubah kode C# tersebut menjadi bahasa mesin C++ lewat fitur bernama **Il2Cpp**. Akibatnya, kita tidak bisa lagi membaca kodenya dengan mudah.
*   **frida-il2cpp-bridge**: Ini adalah alat bantu (library) ajaib! Library ini menerjemahkan bahasa mesin C++ dari Il2Cpp kembali ke bentuk yang mirip dengan C# aslinya, sehingga kita bisa dengan mudah mencari "Kelas" (Class), "Fungsi" (Method), dan "Variabel" (Field) game tersebut lewat JavaScript.

## 2. Membedah `src/toolkit.ts` (Alat Tempur Kita)

File ini ibarat kotak perkakas (toolbox). Isinya bukan modifikasi game secara langsung, melainkan fungsi-fungsi pembantu agar kita tidak perlu menulis kode panjang berulang-ulang.

Mari kita lihat beberapa fitur andalannya:

### A. Membajak Hasil Fungsi (`hookMethodReturn` & `forceReturn`)
Bayangkan game punya fungsi `ApakahPemainPunyaSkinVIP()`. Normalnya, game akan menjawab `false` (tidak). Dengan alat tempur di `toolkit.ts`, kita bisa membajak fungsi ini:
"Hei Frida, kalau game menjalankan `ApakahPemainPunyaSkinVIP()`, jangan jalankan kode aslinya, langsung saja paksa jawabannya menjadi `true`!"
Inilah esensi dari teknik **Hooking** (Memancing/Membajak).

### B. Mencari Kelas (`findClass`)
Di dalam game, semua hal dikelompokkan ke dalam "Kelas" (Class). Contoh: Kelas `Pemain`, Kelas `Senjata`, Kelas `DataSistem`. Fungsi `findClass` membantu kita mencari kelas ini di dalam lautan kode game.

### C. Mencari Objek yang Hidup (`Il2Cpp.gc.choose`)
`findClass` hanya mencari "cetak biru" (blueprint) dari kelas. Tapi bagaimana jika kita ingin mengubah data pemain yang sedang bermain *saat ini*? Di situlah kita menggunakan `Il2Cpp.gc.choose`. Ini seperti bertanya kepada game: "Tolong kumpulkan semua Objek 'Pemain' yang saat ini sedang aktif (hidup) di memori."

## 3. Membedah `src/index.ts` (Tempat Aksi Dimulai)

File ini adalah otak utama modding kita. Di sinilah kita menggunakan alat-alat dari `toolkit.ts` untuk benar-benar memodifikasi game.

Mari kita telusuri alur kerjanya:

### A. Memulai Modifikasi (`Il2Cpp.perform`)
```typescript
Il2Cpp.perform(() => {
  // Semua aksi modding ada di sini
});
```
Ini adalah gerbang utama. Kode ini memberitahu Frida: "Tunggu sampai mesin Il2Cpp gamenya benar-benar siap dan menyala, baru jalankan kode kita." Jika kita tidak menggunakan ini, game bisa *crash* (force close).

### B. Mengatur Nama Modul (`Il2Cpp.$config.moduleName`)
```typescript
Il2Cpp.$config.moduleName = "liblogic.so";
```
Game Il2Cpp biasanya menaruh logika utamanya di file bernama `libil2cpp.so`. Namun, beberapa game tertentu (seperti yang ditargetkan script ini), mengubah namanya menjadi `liblogic.so` atau memisahkannya. Kode ini memberitahu library kita: "Hei, cari kodenya di `liblogic.so` ya!"

### C. Bypass / Membuka Fitur (Unlock Skin)
Di sinilah letak keajaiban terjadi!
```typescript
// Memaksa fungsi IsCanUseSkin selalu menjawab 'true' (bisa digunakan)
Toolkit.hookMethodReturn("SystemData", "IsCanUseSkin", true);
```
Game punya kelas `SystemData` dengan fungsi `IsCanUseSkin`. Kita menggunakan Toolkit kita untuk membajaknya agar selalu mengizinkan kita memakai skin apa pun.

**🌟 PENTING: Trik Angka `2` untuk Skin Rahasia (Unreleased Skin) 🌟**
Dalam beberapa eksperimen, hanya mengembalikan nilai `true` saja tidak cukup untuk skin yang *belum dirilis* (unreleased). Sistem game terkadang meminta angka tertentu sebagai kode argumen verifikasi.
Oleh karena itu, pada refactoring di `index.ts`, kita memodifikasi agar fitur *unlock skin* ini memasukkan/mengembalikan argumen angka `2` untuk memunculkan unreleased skin.

### D. Fitur Menu Chat Command (No CD & Hide Name)
Script ini juga menyuntikkan menu rahasia lewat fitur *Chat* di dalam game.
Kita membajak (`intercept`) fungsi `ShowChatHistoryText` di kelas `BattleBridge`.
Setiap kali ada pesan chat muncul, kita periksa: "Apakah pesan ini mengandung hashtag `#nocd` atau `#hide_name`?"
*   Jika ya: Jangan tampilkan di chat, tapi aktifkan fitur *No Cooldown* (tanpa jeda skill) atau sembunyikan nama pemain.
*   Jika tidak: Biarkan fungsi berjalan normal (tampilkan chat seperti biasa).

### Mengapa Harus Ada `try-catch`?
Kamu akan sering melihat blok `try { ... } catch (e) { ... }` di dalam kode. Ini sangat penting untuk pemula! Modding memori itu berbahaya; sedikit saja kita salah mengakses data yang tidak ada, game akan *force close* (crash). `try-catch` berfungsi sebagai jaring pengaman: "Coba jalankan kode ini, tapi kalau error, jangan matikan gamenya, cukup abaikan saja."

---
Semoga penjelasan ini membantu kamu memahami dunia modding game Unity! Jangan takut untuk bereksperimen dan membaca log error untuk belajar lebih banyak.
