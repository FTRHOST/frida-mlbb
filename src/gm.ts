import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("Berhasil meload gm.ts");

  const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;

  // 1. Hooking IsSandBoxIp agar mengaktifkan GM Mode
  const GameInitClass = AssemblyCSharp.class("GameInit");
  const IsSandBoxIp = GameInitClass.method("IsSandBoxIp");

  Interceptor.attach(IsSandBoxIp.virtualAddress, {
    onLeave(retval: any) {
      retval.replace(1);
    },
  });

  // 2. Mengubah variabel instance _bGmLogin menjadi true
  const CheckLoginConnect = GameInitClass.method("CheckLoginConnect");
  Interceptor.attach(CheckLoginConnect.virtualAddress, {
    onEnter(args: any) {
      Il2Cpp.gc.choose(GameInitClass).forEach((instance) => {
        try {
          instance.field("_bGmLogin").value = true;
        } catch (e) {}
      });

      // 3. Memancing download package GM menggunakan UIMgr
      try {
        const UIMgrClass = AssemblyCSharp.class("UIMgr");
        console.log("[GM] Mencari instance UIMgr untuk memancing download...");

        const CheckModuleInfoRes = UIMgrClass.method("CheckModuleInfoRes");

        Il2Cpp.gc.choose(UIMgrClass).forEach((uiMgr) => {
          const checkModuleMethod = UIMgrClass.tryMethod(
            "CheckModuleInfoRes",
            4,
          );
          if (checkModuleMethod) {
            console.log("[GM] Memanggil CheckModuleInfoRes('GM') di UIMgr...");
            // Parameter: (string moduleNames, int iDownloadingMessage, int iDownloadMessage, bool showTips)
            checkModuleMethod.invoke(Il2Cpp.string("GM"), 0, 0, false);

            console.log(
              "[GM] Memanggil CheckModuleInfoRes('UI_GM_MainInterface') di UIMgr...",
            );
            checkModuleMethod.invoke(
              Il2Cpp.string("UI_GM_MainInterface"),
              0,
              0,
              false,
            );
          }
        });
      } catch (e) {
        console.log("Error memancing UIMgr: " + e);
      }

      // 4. Memancing menggunakan LoadResModuleMgr
      try {
        const LoadResClass = AssemblyCSharp.class("LoadResModuleMgr");
        Il2Cpp.gc.choose(LoadResClass).forEach((loadRes) => {
          const checkModuleMethod2 = LoadResClass.tryMethod(
            "CheckModuleInfoRes",
            5,
          );
          if (checkModuleMethod2) {
            // Parameter membutuhkan string array, jadi kita buat array
            const stringArray = Il2Cpp.array(
              Il2Cpp.corlib.class("System.String"),
              [Il2Cpp.string("GM")],
            );

            console.log(
              "[GM] Memanggil CheckModuleInfoRes('GM') di LoadResModuleMgr...",
            );
            // Parameter: (string[] moduleNames, int iDownloadingMessage, int iDownloadMessage, bool showTips, bool IsPauseToDownload)
            checkModuleMethod2.invoke(stringArray, 0, 0, false, false);
          }
        });
      } catch (e) {
        console.log("Error memancing LoadResModuleMgr: " + e);
      }
    },
  });
});
