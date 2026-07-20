import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

export function hookAssetPatchAndSandbox() {
  Il2Cpp.perform(() => {
    console.log("[*] Starting Asset/Patch and Sandbox bypass...");

    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;

    // 1. Kita bisa menargetkan class Gumiho untuk memanipulasi field 'm_HasRepack' dkk jika diperlukan,
    // tapi cara paling aman adalah mem-bypass metode pengecekannya langsung.
    const gumihoClass = AssemblyCSharp.tryClass("Gumiho");
    if (gumihoClass) {
      console.log(
        "[+] Class Gumiho ditemukan. Menyiapkan bypass untuk Anti-Repack...",
      );
    }

    // Daftar nama method yang kita temukan sebelumnya terkait keamanan dan sandbox
    const methodsToBypass = [
      "SelfMd5Verify",
      "LoadResVerify",
      "IsSandbox",
      "IsAdjustSandBox",
      "CheckVersionInSandBox",
      "OnCustomVerifyResConf",
      "HttpVerify",
      "HttpsVerify",
      "ReportAssetBundleError",
      "IsTransferVerify",
      // "CheckFileMd5_SubThread",
      "SandBoxCheckSubThreadParseElement",
      "StartPathFixer",
      "StartPlayerPrefsFixer",
      "get_bAstcInPack",
      "IsCloseAstcInPackVar",
    ];

    // 2. Loop semua class di dalam Assembly-CSharp untuk mencari method tersebut
    // karena kita mungkin tidak tahu persis semua namespace-nya.
    for (const klass of AssemblyCSharp.classes) {
      for (const method of klass.methods) {
        if (methodsToBypass.includes(method.name)) {
          try {
            (method as any).implementation = function (...args: any[]) {
              console.log(
                `[!] Bypassed: ${klass.namespace}.${klass.name}::${method.name}`,
              );

              const lowerName = method.name.toLowerCase();

              if (method.returnType.name === "System.Boolean") {
                if (lowerName.includes("sandbox")) {
                  return false;
                }
                if (lowerName.includes("astc")) {
                  return true;
                }
                return true;
              }

              if (method.returnType.name === "System.Void") {
                return;
              }

              // Jika bukan boolean atau void, kita kembalikan null sebagai failsafe
              // untuk menghindari error method.invoke
              return null;
            };
            console.log(
              `[+] Berhasil hook: ${klass.namespace}.${klass.name}::${method.name}`,
            );
          } catch (e) {
            console.error(
              `[-] Gagal hook: ${klass.name}::${method.name} - ${(e as Error).message}`,
            );
          }
        }
      }
    }

    console.log("[*] Proses bypass Asset & Sandbox selesai!");
  });
}
