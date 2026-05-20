# MLBB Ultimate IL2CPP Toolkit - Comprehensive Documentation

Dokumentasi ini berisi seluruh fitur modding yang tersedia dalam toolkit ini. Semua perintah dapat dijalankan langsung di Frida Console.

---

## 1. Inspeksi & Pemetaan (Inspection)
Gunakan fitur ini untuk mempelajari struktur kelas, field, dan method game.

*   **`findClasses(keyword)`**: Mencari nama kelas yang mengandung kata kunci tertentu.
    *   *Contoh:* `findClasses("Lobby")`
*   **`getClasses(asmName?)`**: Menampilkan daftar semua kelas (opsional filter berdasarkan assembly).
*   **`inspect(target)`**: Menampilkan semua field (beserta nilainya) dan method dari sebuah kelas atau instance objek.
    *   *Contoh:* `inspect("SystemData")` atau `inspect(ptr("0x12345678"))`
*   **`dumpAll(className)`**: Mencari dan menampilkan semua instance objek dari sebuah kelas yang ada di memory saat ini.
*   **`dumpToFile(className, filename?)`**: Menyimpan hasil dump semua instance ke dalam file teks di folder data game.

## 2. Tracing & Logging
Gunakan fitur ini untuk memantau aktivitas fungsi secara real-time.

*   **`trace(className, methodName, bt?)`**: Memantau kapan sebuah fungsi dipanggil, menampilkan argumen dan return value-nya. (bt=true untuk menampilkan backtrace).
*   **`traceAll(className, exclude?, bt?)`**: Memantau SEMUA fungsi dalam sebuah kelas (kecuali yang di-exclude).
*   **`untrace(className, methodName)`**: Berhenti memantau fungsi tertentu.
*   **`untraceAll(className)`**: Berhenti memantau semua fungsi di kelas tersebut.
*   **`bt()`**: Menampilkan Backtrace (Call Stack) saat ini.
*   **`startLog(filename?)` / `stopLog()`**: Mulai/berhenti mencatat semua log trace ke dalam file.

## 3. Pencarian & Korelasi (Correlation Search)
Fitur canggih untuk menemukan hubungan data (seperti mencari ID pemain).

*   **`correlate(values, classNames)`**: Mencari method mana yang memproses nilai-nilai tertentu (sebagai argumen atau return).
    *   *Contoh:* `correlate([1001, 1002], ["LobbyManager", "PlayerInfo"])`
*   **`correlateReport()`**: Melihat hasil korelasi yang ditemukan (diurutkan berdasarkan yang paling sering muncul).
*   **`correlateStop()`**: Menghentikan scanner korelasi.
*   **`heapSearch(values, classNames?)`**: Mencari objek di memory yang salah satu fieldnya berisi nilai yang dicari.

## 4. Kontrol Game & Manipulasi Nilai
Gunakan fitur ini untuk menghentikan game atau mengubah alur logika.

*   **`freeze(state)`**: Menghentikan seluruh logic game (physics, animations) menggunakan Unity Time.timeScale. (Sangat aman).
*   **`pause()` / `resume()`**: Hard Pause. Menghentikan semua thread game (100% konsistensi memory).
*   **`call(className, methodName, args?, instanceHandle?)`**: Memanggil fungsi game secara manual.
    *   *Contoh:* `call("SystemData", "SetLevel", [99])`
*   **`forceArg(className, methodName, argIndex, value)`**: Memaksa argumen ke-N dari sebuah fungsi agar selalu bernilai tertentu.
*   **`forceReturn(className, methodName, value, execOriginal?)`**: Memaksa sebuah fungsi agar selalu mengembalikan nilai tertentu.

## 5. Pembekuan Memory (Value Freezer)
Menjaga agar nilai di memory tidak berubah (mirip Game Guardian Freeze).

*   **`freezeClass(className, interval?)`**: Membekukan semua nilai statis dalam sebuah kelas.
*   **`freezeInstance(className, handle, interval?)`**: Membekukan semua nilai pada objek tertentu.
*   **`unfreeze(id?)`**: Berhenti membekukan.
*   **`freezerList()`**: Melihat daftar apa saja yang sedang dibekukan.

## 6. Fitur Permanen (Persistence)
Menyimpan modifikasi agar otomatis aktif setiap kali game dibuka (Auto-apply saat startup).

*   **`saveFreeze(className)`**: Menyimpan nilai statis kelas saat ini agar otomatis dibekukan setiap kali login.
*   **`removeFreeze(className)`**: Menghapus patch permanen untuk kelas tersebut.
*   **`saveHook(className, methodName, value)`**: Menyimpan hook agar sebuah fungsi selalu mengembalikan nilai tertentu setiap kali game dijalankan.
    *   *Contoh:* `saveHook("AccountData", "IsVIP", true)`
*   **`removeHook(className, methodName?)`**: Menghapus hook permanen.
*   **`loadFreezes()` / `loadHooks()`**: Memuat ulang patch secara manual.

## 7. Sistem Aktivitas (Activity System Tools)
Fitur khusus untuk memodifikasi event/aktivitas di dalam game (berdasarkan `liblogic.so`).

*   **`MasterConfig`**: Objek konfigurasi utama untuk sistem aktivitas.
    *   `MasterConfig.enabled = true`: Mengaktifkan seluruh sistem patch aktivitas.
    *   `MasterConfig.debug = true`: Menampilkan log saat patch diterapkan.
*   **`GlobalPatch`**: Objek konfigurasi global untuk semua aktivitas.
    *   *Contoh:* `GlobalPatch.bShowInList = true`
*   **`TypePatches` / `IdPatches`**: Konfigurasi spesifik berdasarkan Tipe atau ID Aktivitas.
*   **`refreshActivities()`**: Menerapkan ulang konfigurasi patch ke semua aktivitas yang sedang tersimpan di cache game. Jalankan ini setelah mengubah `GlobalPatch` atau `MasterConfig`.
*   **`dumpActivities()`**: Melakukan dump data statis dari semua aktivitas yang terdeteksi ke file JSON.

---
*Dokumentasi ini diperbarui secara otomatis oleh Gemini CLI.*
