# Panduan MASTER OVERRIDE SYSTEM (IL2CPP Mod Engine)

Dokumen ini menjelaskan konsep, waktu yang tepat (timing), dan teknis implementasi dari **Master Override System** yang dirancang khusus untuk game berbasis Unity IL2CPP (seperti Mobile Legends).

---

## 1. Apa itu Master Override System?

**Master Override System** adalah arsitektur modifikasi terpusat yang memungkinkan pengembang mod untuk mengontrol ribuan data game (seperti Event, Aktivitas, Skin, atau Fitur) hanya dari satu konfigurasi utama. 

Sistem ini menggunakan prinsip **Hirarki Prioritas**:
1.  **ID Patch** (Prioritas Tertinggi): Modifikasi spesifik untuk satu item tertentu.
2.  **Type Patch**: Modifikasi untuk kelompok item dengan tipe yang sama.
3.  **Global Patch** (Prioritas Terendah): Modifikasi umum yang berlaku untuk semua jika tidak ada spesialisasi.

---

## 2. Timing Patching: Kapan Waktu yang Tepat?

Salah satu penyebab utama *Force Close* (FC) adalah **Race Condition** (kondisi balapan) antara script mod dan proses loading game.

### A. Waktu yang Salah
*   **Terlalu Cepat:** Melakukan patch saat `libil2cpp.so` baru di-load tapi metadata belum diinisialisasi.
*   **Terlalu Lambat:** Melakukan patch setelah UI game sudah dirender. Data lama sudah terlanjur ditampilkan, atau game crash karena data yang diakses berubah di tengah jalan.

### B. Waktu yang Tepat (Safe Zone)
1.  **Il2Cpp.perform()**: Selalu gunakan pembungkus ini di Frida. Ini memastikan mesin IL2CPP sudah siap (Domain & Assemblies loaded).
2.  **Just-In-Time (JIT) Patching**: Jangan memodifikasi data secara massal di awal. Sebaliknya, hook fungsi **"Constructor"** atau **"Visitor"**.
    *   *Contoh:* Hook `MTTDProto.CmdActivityData::visit`. 
    *   **Logika:** Setiap kali server mengirim data aktivitas, game akan memanggil `visit`. Kita biarkan fungsi asli berjalan dulu (`originalVisit`), lalu di baris berikutnya kita timpa (override) nilainya. Ini 100% aman dari FC karena data dimodifikasi tepat sebelum dikonsumsi oleh UI.
3.  **Deferred Loading**: Gunakan `setTimeout` (misal 5-15 detik) untuk fitur persistence yang mencari instance di memory (seperti `ActivityManagerController`).

---

## 3. Implementasi Teknis dalam `il2cpp.hpp`

Dalam konteks pengembangan mod engine (C++ atau Frida), berikut adalah langkah teknis implementasinya:

### A. Struktur Data Konfigurasi
Gunakan objek atau struct untuk menyimpan aturan patch:
```typescript
const MasterConfig = {
    enabled: true,  // Master switch
    debug: true     // Log monitor
};

const GlobalPatch = {
    bShowInList: true,
    iEndTime: 2147483647 // Selalu aktif (Infinity)
};
```

### B. Logic Apply (Snapshot & Revert)
Sangat penting untuk menyimpan data asli sebelum menimpanya. Jika user mematikan mod, kita bisa mengembalikan nilai asli tanpa perlu restart game.
```typescript
const originalDataMap = new Map();

function applyLogic(instance) {
    const id = instance.iActivityId;
    
    // Simpan snapshot jika belum ada
    if (!originalDataMap.has(id)) {
        originalDataMap.set(id, { /* ambil nilai asli */ });
    }

    if (!MasterConfig.enabled) {
        // REVERT: Kembalikan ke asli
        patchObject(instance, originalDataMap.get(id));
        return;
    }

    // APPLY: Timpa dengan konfigurasi mod
    patchObject(instance, GlobalPatch);
}
```

### C. Hooking Visitor Method
Ini adalah kunci agar tidak Force Close. Kita mencegat saat data diproses dari format server ke format memory game.
```typescript
const CmdActivityData = findClass("CmdActivityData");
const visit = CmdActivityData.method("visit");

visit.implementation = function(sdp, flag) {
    // 1. Jalankan fungsi asli (Parsing data server)
    this.invoke(sdp, flag); 

    // 2. Override data di memory tepat SETELAH parsing selesai
    applyLogic(this); 
};
```

---

## 4. Tips Menghindari Force Close

1.  **Cek Null Pointer**: Sebelum mengakses field dari sebuah instance, selalu pastikan instance tersebut tidak null (`!instance.isNull()`).
2.  **Gunakan Try-Catch**: Bungkus logika override dalam blok `try-catch` agar jika terjadi error pada satu item, game tidak crash secara keseluruhan.
3.  **Data Type Alignment**: Pastikan tipe data yang anda masukkan sesuai dengan `il2cpp.hpp`. Jika field bertipe `Int32`, jangan masukkan `String`.
4.  **Avoid String Over-allocation**: Untuk field string Unity, gunakan `Il2Cpp.string("konten")` dengan hati-hati untuk menghindari memory leak.

---
*Dokumen ini dibuat untuk membantu pengembangan mod engine IL2CPP yang stabil dan efisien.*
