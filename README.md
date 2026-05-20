# Mobile Game Modding with Frida and Il2Cpp

Proyek ini adalah contoh script modding game Unity berbasis Il2Cpp menggunakan Frida dan modul `frida-il2cpp-bridge`. Script ini didesain sebagai alat pembelajaran yang ramah bagi pemula, yang memungkinkan modifikasi perilaku game langsung dari memori tanpa harus membongkar (decompile) APK secara permanen.

## Prasyarat

Sebelum menggunakan script ini, pastikan Anda telah memenuhi persyaratan berikut:

1.  **Perangkat Android yang sudah di-Root**: Frida membutuhkan akses root untuk menyuntikkan script ke dalam proses game yang sedang berjalan. (Atau gunakan emulator seperti LDPlayer/Nox dengan akses root diaktifkan).
2.  **Frida Server**: Harus sudah terpasang dan berjalan di perangkat Android Anda. Versi Frida server harus sesuai dengan versi Frida yang Anda gunakan di komputer.
3.  **Node.js**: Pastikan Node.js sudah terinstal di komputer Anda untuk mengelola dependensi dan melakukan kompilasi TypeScript.
4.  **Game Target**: Sebuah game Android berbasis Unity Il2Cpp (biasanya ditandai dengan adanya file `libil2cpp.so` dan folder `il2cpp_data` di dalam APK).

## Instalasi

1.  Buka terminal/command prompt di direktori proyek ini.
2.  Jalankan perintah berikut untuk mengunduh semua dependensi yang dibutuhkan:
    ```bash
    npm install
    ```

## Kompilasi

Script ini ditulis menggunakan TypeScript agar lebih mudah dibaca dan dikelola. Sebelum dijalankan oleh Frida, kita perlu mengompilasinya menjadi satu file JavaScript tunggal (`agent.js`).

Jalankan perintah berikut untuk mengompilasi:
```bash
npm run build
```
*(Catatan: Anda juga bisa menggunakan `npm run watch` agar script otomatis dikompilasi ulang setiap kali Anda menyimpan perubahan).*

File hasil kompilasi akan berada di `dist/agent.js`.

## Cara Menjalankan

1.  Pastikan Frida Server sudah berjalan di HP/Emulator.
2.  Sambungkan perangkat ke komputer via USB (pastikan USB Debugging aktif).
3.  Buka terminal dan jalankan perintah berikut:
    ```bash
    frida -U -f <nama_package_game> -l dist/agent.js
    ```
    *Ganti `<nama_package_game>` dengan package ID game target, contoh: `com.developer.gameku`.*

    Perintah di atas akan:
    *   `-U`: Terhubung ke perangkat USB (atau emulator).
    *   `-f`: Me-*restart* (spawn) game dari awal agar script bisa berjalan sejak awal game dimuat.
    *   `-l dist/agent.js`: Memuat file script hasil kompilasi kita.

## Struktur Proyek

*   `src/index.ts`: Titik masuk (entry point) utama script. Berisi logika spesifik untuk modding game target (seperti *unlock skin*, pantau fitur, bypass).
*   `src/toolkit.ts`: File pustaka (library) berisi fungsi-fungsi pembantu (helper) untuk mempermudah manipulasi Il2Cpp, seperti mencari kelas, mengganti hasil fungsi (*hooking*), mencari nilai di memori, dsb.
*   `docs/penjelasan_kode.md`: Dokumentasi detail baris-per-baris untuk pemula. Wajib dibaca!
