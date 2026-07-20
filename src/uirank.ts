import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("Berhaaasil cuy");

  // Gunakan path absolut yang memiliki izin tulis
  const logFilePath = "/data/data/com.mobile.legends/uirank.txt";
  const logFile = new (File as any)(logFilePath, "a");

  // --- DI SINI KUNCINYA ---
  // Simpan fungsi console.log asli bawaan Frida
  const originalConsoleLog = console.log;

  // Alihkan fungsi console.log global agar otomatis menulis ke file
  console.log = function (message: any) {
    // Tetap tampilkan di layar terminal komputer Anda
    originalConsoleLog(message);

    // Tulis pesan ke dalam file teks di Android beserta baris baru
    logFile.write(message + "\n");
    logFile.flush();
  };
  // ------------------------

  const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;
  const UIRankHero = AssemblyCSharp.class("UIRankHero");
  const SystemData = AssemblyCSharp.class("SystemData");
  const GetBattlePlayerInfo = SystemData.method("GetBattlePlayerInfo");

  // Sekarang, semua output dari fungsi trace ini akan otomatis masuk ke file uirank.txt
  Il2Cpp.trace().classes(UIRankHero).and().attach();

  Interceptor.attach(GetBattlePlayerInfo.virtualAddress, {
    onEnter(args) {
      const instances = Il2Cpp.gc.choose(UIRankHero);

      instances.forEach((uirankObject) => {
        const iChangeHeroTimeSpan = uirankObject.field("iChangeHeroTimeSpan").value;
        const iBanTimeSpan = uirankObject.field("iBanTimeSpan").value;
        const iSecondBanTimeSpan = uirankObject.field("iSecondBanTimeSpan").value;
        const iPickTimeSpan = uirankObject.field("iPickTimeSpan").value;
        const ibantwoherospan = uirankObject.field("iBanTwoHeroSpan").value;

        // Cukup gunakan console.log biasa, otomatis tersimpan ke file berkat pengalihan di atas
        console.log(`--- Log Entry ---`);
        console.log(`Ini adalah iChangeHeroTimeSpan: ${iChangeHeroTimeSpan}`);
        console.log(`Ini adalah iBanTimeSpan: ${iBanTimeSpan}`);
        console.log(`Ini adalah iSecondBanTimeSpan: ${iSecondBanTimeSpan}`);
        console.log(`Ini adalah iPickTimeSpan: ${iPickTimeSpan}`);
        console.log(`Ini adalah ibantwoherospan: ${ibantwoherospan}\n`);
      });
    },
  });
});
