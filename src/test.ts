import "frida-il2cpp-bridge";
Il2Cpp.$config.moduleName = "liblogic.so";
Il2Cpp.perform(() => {
  console.log("[*] Frida Il2Cpp Bridge Ready!");

  // ---------------------------------------------------------
  // 1. MENDETEKSI CHAT (HOOKING)
  // ---------------------------------------------------------
  // Secara teoritis, kita mencari class yang menangani input chat.
  // Contoh abstrak: Class 'ChatManager', Method 'OnSend(string message)'
  const assembly = Il2Cpp.domain.assembly("Assembly-CSharp").image;
  const BattleBridge = assembly.class("BattleBridge"); // Class fiktif
  const ShowChatHistoryText = BattleBridge.method("ShowChatHistoryText"); // Method fiktif

  // Mengganti (intercept) implementasi fungsi aslinya
  ShowChatHistoryText.implementation = function (messageObj) {
    // Casting agar TypeScript mengenali objek ini sebagai String Il2Cpp
    const il2cppStr = messageObj as Il2Cpp.String;
    const rawContent = il2cppStr.content;

    if (rawContent) {
      const msg: string = rawContent.toString();

      // 1. Gunakan matchAll dengan flag /g (global) untuk mencari SEMUA kecocokan di seluruh riwayat chat
      // Spread operator [...] akan mengubah hasilnya menjadi sebuah Array
      const matches = [...msg.matchAll(/#(\w+)/g)];

      // 2. Cek apakah ada setidaknya satu perintah yang ditemukan
      if (matches.length > 0) {
        // 3. Ambil elemen paling terakhir dari array (yaitu chat paling bawah/terbaru)
        const lastMatch = matches[matches.length - 1];

        // lastMatch[1] berisi kata sandinya (capture group pertama)
        if (lastMatch && lastMatch[1]) {
          const cmd = lastMatch[1].toLowerCase();
          console.log(`[Command] Detected: ${cmd}`);

          // ... logika eksekusi perintah (hideui, dll) ...
          if (cmd == "hideui") {
            ExecuteHideUI();
          }
        }
      }
    }
    // Perbaikan 1: Gunakan '!' pada method("OnSend")
    // Perbaikan 2: Gunakan il2cppStr.handle alih-alih messageObj.handle
    return this.method("ShowChatHistoryText")!.invoke(il2cppStr.handle);
  };

  // ---------------------------------------------------------
  // 2. MENG-INVOKE METHOD (CALLMETHOD)
  // ---------------------------------------------------------
  function ExecuteHideUI() {
    console.log("[*] Executing UI Toggle...");

    // Asumsi ada class pengatur UI, contoh: 'UIController'

    // Skenario A: Jika methodnya adalah method STATIS (Static Method)
    // Pemanggilannya sangat mudah, tidak perlu mencari instance.
    // uiControllerClass.method("ToggleAllUIShow").invoke();

    // Skenario B: Jika methodnya adalah INSTANCE (seperti di skrip C++ kamu)
    // Kita harus melakukan "Heap Scan" untuk mencari objek yang sedang hidup di memori.
    // Ini adalah ekuivalen dari il2cpp_gc_foreach_heap di C++.
    Il2Cpp.gc.choose(BattleBridge).forEach((instance) => {
      console.log(`[*] Found UIController instance at ${instance.handle}`);

      // Melakukan invoke method pada instance tersebut
      // Ekuivalen dengan il2cpp_runtime_invoke
      instance.method("ToggleAllUIShow").invoke();
    });
  }
});
