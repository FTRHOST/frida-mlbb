import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

/* Il2Cpp.perform(() => {
  console.log("[*] IL2CPP Tournament Reader started...");
  const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;

  const UIRankHero = AssemblyCSharp.class("UIRankHero");

  const SystemData = AssemblyCSharp.class("SystemData");

  const CheckFileMd5_SubThread = SystemData.method("CheckFileMd5_SubThread");

  Interceptor.replace(
    CheckFileMd5_SubThread.virtualAddress,
    new NativeCallback(
      function () {
        // Biarkan kosong untuk mensimulasikan NOP (fungsi langsung return tanpa melakukan apa-apa)
        console.log(
          "[*] Fungsi CheckFileMd5_SubThread Berhasil Di-NOP / Dilewati",
        );
      },
      "void",
      [],
    ),
  );

  const ShowPicking = UIRankHero.method("ShowPicking");

  const TargetClass = AssemblyCSharp.class("ModuleCheck");

  const TargetMethod = TargetClass.method("StartModuleCheck");

  TargetMethod.implementation = function () {};

  Il2Cpp.trace(true).methods(ShowPicking).and().attach();
  // Il2Cpp.trace(false).classes(LogicFighter).and().attach();
});

*/

Il2Cpp.perform(() => {
  console.log("Hooking Download Checks...");

  // Hook class ModuleInfo
  const ModuleInfo = Il2Cpp.domain
    .assembly("Assembly-CSharp")
    .image.class("MiniPatchMgr");
  if (ModuleInfo) {
    ModuleInfo.method("IsModuleActive").implementation = function () {
      return true;
    };
    console.log("[+] Hooked ModuleInfo");
  }

  // Hook class LoadResModuleMgr
  const LoadResModuleMgr = Il2Cpp.domain
    .assembly("Assembly-CSharp")
    .image.class("LoadResModuleMgr");
  if (LoadResModuleMgr) {
    try {
      LoadResModuleMgr.method("isCanDownload").implementation = function (
        moduleInfo,
        level,
        manual,
      ) {
        return true;
      };
    } catch (e) {}

    try {
      LoadResModuleMgr.method("IsNeedDownload").implementation = function (
        uid,
      ) {
        return true;
      };
    } catch (e) {}
    console.log("[+] Hooked LoadResModuleMgr");
  }

  // Hook CommonDownloadMgr
  const CommonDownloadMgr = Il2Cpp.domain
    .assembly("Assembly-CSharp")
    .image.tryClass("CommonDownloadMgr");
  if (CommonDownloadMgr) {
    try {
      CommonDownloadMgr.method("get_IsDownloadAvailable").implementation = function () {
        return true;
      };
      console.log("[+] Hooked CommonDownloadMgr.get_IsDownloadAvailable");
    } catch (e) {
      console.error("Failed to hook CommonDownloadMgr: ", e);
    }
  }

  // Hook Download Permission Check (IsDownloadAllow)
  // Ini method global dari dump, sepertinya di GameEntry atau ResourceManager (namun tanpa class specifier spesifik dari pencarian awk sebelumnya),
  // Mari hook yang jelas di ModeVersionData dan IDownloadInfo.
  
  const ModeVersionData = Il2Cpp.domain
    .assembly("Assembly-CSharp")
    .image.tryClass("ModeVersionData");
  
  if (ModeVersionData) {
      try {
          ModeVersionData.method("IsNeedDownload").implementation = function () {
              return true;
          };
          console.log("[+] Hooked ModeVersionData.IsNeedDownload");
      } catch (e) {
          console.error("Failed to hook ModeVersionData: ", e);
      }
  }

  const IDownloadInfo = Il2Cpp.domain
    .assembly("Assembly-CSharp")
    .image.tryClass("IDownloadInfo");
  if (IDownloadInfo) {
      try {
          IDownloadInfo.method("IsNeedDownload").implementation = function () {
              return true;
          };
          console.log("[+] Hooked IDownloadInfo.IsNeedDownload");
      } catch (e) {
          console.error("Failed to hook IDownloadInfo: ", e);
      }
  }

  // Try hooking Game Mode Download Allow
  const DownloadMgrBase = Il2Cpp.domain
    .assembly("Assembly-CSharp")
    .image.classes.find(c => c.name.includes("DownloadMgr"));
    
  if(DownloadMgrBase) {
     try {
       const isAllowMethod = DownloadMgrBase.tryMethod("IsDownloadAllow");
       if(isAllowMethod) {
          isAllowMethod.implementation = function() { return true; };
          console.log(`[+] Hooked ${DownloadMgrBase.name}.IsDownloadAllow`);
       }
     } catch (e) {}
  }

});
