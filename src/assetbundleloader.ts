import "frida-il2cpp-bridge";

export function forceLoadSceneAssetBundle(customBundlePath: string) {
    Il2Cpp.perform(() => {
        try {
            console.log("[*] Memasang hook pengalihan AssetBundle ke: " + customBundlePath);
            
            const AssetBundle = Il2Cpp.domain.assembly("UnityEngine.AssetBundleModule").image.class("UnityEngine.AssetBundle");
            
            // Hook LoadFromFile(string)
            const LoadFromFile = AssetBundle.tryMethod("LoadFromFile", 1);
            if (LoadFromFile) {
                (LoadFromFile as any).implementation = function (pathObj: Il2Cpp.String) {
                    if (pathObj != null && pathObj.content != null) {
                        const pathStr = pathObj.content.toLowerCase();
                        // Kita hanya akan me-redirect jika file yang di-load persis adalah file scene aslinya
                        // Untuk menghindari mengganti minimap atau file UI lainnya secara tidak sengaja
                        if (pathStr.endsWith("pvp_049_low_add.unity3d")) {
                            console.log(`[+] Mengalihkan LoadFromFile: ${pathStr} -> ${customBundlePath}`);
                            return LoadFromFile.invoke(Il2Cpp.string(customBundlePath));
                        }
                    }
                    return LoadFromFile.invoke(pathObj);
                };
            }

            // Hook LoadFromFileAsync(string)
            const LoadFromFileAsync = AssetBundle.tryMethod("LoadFromFileAsync", 1);
            if (LoadFromFileAsync) {
                (LoadFromFileAsync as any).implementation = function (pathObj: Il2Cpp.String) {
                    if (pathObj != null && pathObj.content != null) {
                        const pathStr = pathObj.content.toLowerCase();
                        // Filter spesifik ke file map saja
                        if (pathStr.endsWith("pvp_049_low_add.unity3d")) {
                            console.log(`[+] Mengalihkan LoadFromFileAsync: ${pathStr} -> ${customBundlePath}`);
                            return LoadFromFileAsync.invoke(Il2Cpp.string(customBundlePath));
                        }
                    }
                    return LoadFromFileAsync.invoke(pathObj);
                };
            }
            
            console.log("[+] Hook AssetBundle berhasil dipasang. Game akan memuat scene modifikasi Anda saat dibutuhkan.");
        } catch (e) {
            console.error(`[-] Error saat memasang hook AssetBundle: ${(e as Error).message}`);
        }
    });
}
