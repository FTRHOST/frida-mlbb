import "frida-il2cpp-bridge";
import { Toolkit } from "./toolkit.js";

/**
 * ==============================================================================
 * MLBB ULTIMATE IL2CPP MULTI-TRACER TOOLKIT
 * Refactored for Bridge & Logic Module targeting
 * ==============================================================================
 */

// Targetkan liblogic.so karena sebagian besar logika game (SystemData, Activity) ada di sana
Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("[+] Ultimate API IL2CPP Initialized (via Bridge).");

  // ==========================================
  // GLOBAL BYPASS (Unlocking Features)
  // ==========================================
  // Memaksa berbagai pengecekan ketersediaan skin agar selalu 'true' (tersedia)
  // Toolkit.hookMethodReturn("SystemData", "CheckMapSkinAvailable", true);
  //  Toolkit.hookMethodReturn("GameInit", "IsDownloadEnviromentIsolate", true);
  Toolkit.hookMethodReturn("SystemData", "IsCanUseSkin", true);
  Toolkit.hookMethodReturn("UIChooseHero", "CanSelectSkin", true);
  Toolkit.hookMethodReturn("ChooseHeroMgr", "IsSkinUseable", true);

  // Toolkit.blockMethod("MTTDProto.CmdActivityData", "visit");

  // ==========================================
  // FORBIDDEN SKINS MONITORING SYSTEM
  // ==========================================

  // Daftar ID Skin yang didapat dari forbidden_skins_dump.json
  const targetedSkinIds = new Set([
    1435, 1437, 100712, 105212, 108412, 610751, 611941, 612542, 613261, 614241,
    614331, 614381, 614382, 615081, 616961, 616962, 617071, 617072, 618591,
    618731, 619331, 619861, 619862, 620251, 620252, 620861, 620862, 622651,
    622652, 622741, 622742, 622841, 622842, 623131, 623132, 61026141, 61032101,
    61032102, 61052121, 61073111, 61073112, 61080131, 61103111
  ]);

  // Map untuk menyimpan status dilarang (true) atau tidak (false)
  const forbiddenSkinsMap = new Map<number, boolean>();

  /**
   * Fungsi untuk menyimpan daftar skin yang terdeteksi dilarang ke JSON secara berkala
   */
  const saveForbiddenSkins = () => {
    try {
      const forbiddenSkins = Array.from(forbiddenSkinsMap.entries())
        .filter(([_, isForbidden]) => isForbidden)
        .map(([id, _]) => id)
        .sort((a, b) => a - b);

      if (forbiddenSkins.length === 0) return;

      const dataPath = Il2Cpp.application.dataPath;
      if (!dataPath) return;

      const skinsJson = JSON.stringify(forbiddenSkins, null, 2);
      const skinPath = dataPath + "/forbidden_skins_dump.json";
      const skinFile = new (File as any)(skinPath, "w");
      skinFile.write(skinsJson);
      skinFile.flush();
      skinFile.close();
      console.log(`[+] Auto-Save: ${forbiddenSkins.length} forbidden skins saved.`);
    } catch (e) { }
  };

  // Simpan data setiap 5 detik jika ada perubahan
  // setInterval(saveForbiddenSkins, 5000);

  /**
   * Fungsi untuk mentrace semua method dalam sebuah class yang menerima argument
   * yang nilainya ada dalam daftar targetedSkinIds.
   * Return true jika class ditemukan, false jika tidak.
   */
  const traceClassForSkinIds = (className: string): boolean => {
    const klass = Toolkit.findClass(className);
    if (!klass) {
      return false;
    }

    console.log(`[+] Tracer: Monitoring ${className} for targeted Skin IDs...`);
    klass.methods.forEach(method => {
      // Kita hanya trace method yang punya parameter
      if (method.parameterCount > 0) {
        method.implementation = function (...args: any[]) {
          // Logika pengecekan Skin ID
          for (let i = 0; i < args.length; i++) {
            const argVal = Number(args[i]);
            if (targetedSkinIds.has(argVal)) {
              // TRACE LOG (Commented as requested)
              // console.log(`[🎯 ID TRACE] ${className}::${method.name}(arg[${i}]: ${argVal}) called!`);
            }
          }

          // PERBAIKAN: Gunakan 'this' sebagai parameter pertama untuk non-static methods
          if (method.isStatic) {
            return method.invoke(...args);
          } else {
            return method.invoke(this as any, ...args);
          }
        };
      }
    });
    return true;
  };

  // Aktifkan trace untuk SystemData
  // traceClassForSkinIds("SystemData");

  // Aktifkan trace untuk MTTDProto.CmdActivityData atau CmdActivityData
  /*if (!traceClassForSkinIds("MTTDProto.CmdActivityData")) {
    traceClassForSkinIds("CmdActivityData");
  }*/
  /*
    const SystemData = Toolkit.findClass("SystemData");
    if (SystemData) {
      // --- LOGIKA KHUSUS UNTUK ISFORBIDSKIN ---
      const isForbidSkin = SystemData.methods.find(m =>
        m.name === "IsForbidSkin" &&
        m.parameterCount === 2 &&
        m.parameters[0]?.type.name.includes("UInt32")
      );
  
      if (isForbidSkin) {
        console.log("[+] Hooking IsForbidSkin for data collection...");
        isForbidSkin.implementation = function (skinId: any, filterLua: any) {
          const result = isForbidSkin.invoke(skinId, filterLua);
          const id = Number(skinId);
          const isForbidden = (result === true || result === 1);
  
          // Jika status dilarang berubah, catat dan simpan
          if (forbiddenSkinsMap.get(id) !== isForbidden) {
            // TRACE LOG (Commented as requested)
            // if (isForbidden) console.log(`[!] NEW FORBIDDEN SKIN DETECTED: ${id}`);
            forbiddenSkinsMap.set(id, isForbidden);
          }
  
          return result;
        };
      }
  
      // --- LOGIKA KHUSUS UNTUK MENAMBAH SKIN DILARANG ---
      const addForbidSkin = SystemData.methods.find(m => m.name === "AddForbidSkinByID");
      if (addForbidSkin) {
        addForbidSkin.implementation = function (skinId: any) {
          const id = Number(skinId);
          // TRACE LOG (Commented as requested)
          // console.log(`[Trace] AddForbidSkinByID(id: ${id})`);
          forbiddenSkinsMap.set(id, true);
          return addForbidSkin.invoke(skinId);
        };
      }
  
      const addAndCheck = SystemData.methods.find(m => m.name === "AddAndCheckForbidSkins");
      if (addAndCheck) {
        addAndCheck.implementation = function (skinIds: any) {
          // TRACE LOG (Commented as requested)
          // console.log(`[Trace] AddAndCheckForbidSkins called.`);
          try {
            const list = skinIds as Il2Cpp.Object;
            const count = Number(list.method("get_Count").invoke());
            for (let i = 0; i < count; i++) {
              const id = Number(list.method("get_Item").invoke(i));
              forbiddenSkinsMap.set(id, true);
            }
          } catch (e) { }
          return addAndCheck.invoke(skinIds);
        };
      }
    }
  */
  // ==========================================
  // CONFIGURATION: ACTIVITY OVERRIDES
  // ==========================================

  /**
   * 0. TOGGLE MASTER
   * Set ke 'true' untuk mengaktifkan fitur NOP (Matikan semua aktivitas secara default).
   * Set ke 'false' jika hanya ingin menggunakan whitelist/ID override tanpa mematikan yang lain.
   */
  const useGlobalNop = false;

  /**
   * 1. GLOBAL NOP DEFAULTS
   * Nilai ini akan diterapkan ke SEMUA data aktivitas terlebih dahulu jika 'useGlobalNop' bernilai true.
   */
  const globalNopConfig: Record<string, any> = {
    iActivityType: 0,       // Menjadikan tipe tidak dikenal
    bShowInList: false,    // Hilangkan dari list
    iBeginTime: 0,         // Set waktu mulai ke 0
    iEndTime: 0,           // Set waktu berakhir ke 0
    iShowTimeBegin: 0,
    iShowTimeEnd: 0,
    iMinLevel: 99,         // Syarat level tinggi agar tidak muncul
    bIsTop: false,
    bIsMajor: false,
    bShowOnLogin: false,
    bHideJumpButton: true
  };

  /**
   * 2. TYPES TO OVERRIDE (Whitelist/Custom)
   * Daftar ID tipe aktivitas (iActivityType) yang ingin di-bypass dari NOP 
   * atau diberikan perlakuan khusus.
   */
  const typesToOverride = [
    106,
    117,
    129,
    238,
    417,
    578,
    611,
    626,
    648,
    684,
    710,
    749,
    761,
    763,
    772,
    773,
    777,
    804,
    829,
    850,
    905
  ]; // Contoh ID Tipe

  /**
   * 3. GLOBAL OVERRIDE FOR WHITELISTED TYPES
   * Jika tipe ada di 'typesToOverride', gunakan config ini untuk mengaktifkannya.
   */
  const whitelistedTypeConfig: Record<string, any> = {
    iActivityType: 0,       // Menjadikan tipe tidak dikenal
    bShowInList: true,
    iBeginTime: 0,
    iEndTime: 2147483647,      // Selalu aktif (Max Int32)
    iShowTimeBegin: 0,
    iShowTimeEnd: 2147483647,
    iMinLevel: 0,              // Bisa diakses level berapapun
    bHideJumpButton: false
  };

  /**
   * 4. ID-SPECIFIC OVERRIDES (Highest Priority)
   * Kustomisasi khusus berdasarkan iActivityId tertentu.
   */
  const idSpecificOverrides: Record<string, any> = {
    "12345": {
      iActivityType: 0,
      sJumpUI: "UI_SomeActivity",
      bShowInList: true
    }
  };

  // ==========================================
  // ACTIVITY DATA DUMPING (Statis)
  // ==========================================
  /**
   * Mendump semua data aktivitas dan mengumpulkan semua tipe unik yang ada
   */
  const dumpActivities = () => {
    try {
      const Controller = Toolkit.findClass("Activity.ActivityManagerController");
      if (!Controller) return;
      const instance = Controller.field("_instance").value as Il2Cpp.Object;
      if (instance.isNull()) return;

      const cache = instance.field("m_CacheActs").value as Il2Cpp.Object;
      const count = Number(cache.method("get_Count").invoke());

      const activities = [];
      const uniqueTypes = new Set<number>();

      for (let i = 0; i < count; i++) {
        const act = cache.method("get_Item").invoke(i) as Il2Cpp.Object;
        const titleField = act.field("sTitle").value;
        const jumpUIField = act.field("sJumpUI").value;
        const type = Number(act.field("iActivityType").value);

        uniqueTypes.add(type);

        activities.push({
          id: act.field("iActivityId").value,
          type: type,
          title: titleField instanceof Il2Cpp.String ? titleField.content : null,
          showInList: act.field("bShowInList").value,
          isTop: act.field("bIsTop").value,
          isMajor: act.field("bIsMajor").value,
          minLevel: act.field("iMinLevel").value,
          maxLevel: act.field("iMaxLevel").value,
          beginTime: act.field("iBeginTime").value,
          endTime: act.field("iEndTime").value,
          showTimeBegin: act.field("iShowTimeBegin").value,
          showTimeEnd: act.field("iShowTimeEnd").value,
          jumpUI: jumpUIField instanceof Il2Cpp.String ? jumpUIField.content : null
        });
      }

      const dataPath = Il2Cpp.application.dataPath;
      if (dataPath) {
        // 1. Simpan Full Activity Dump
        const activityJson = JSON.stringify(activities, null, 2);
        const actPath = dataPath + "/activities_dump.json";
        const actFile = new (File as any)(actPath, "w");
        actFile.write(activityJson);
        actFile.flush();
        actFile.close();
        console.log(`[+] SUCCESS: Activity JSON saved to: ${actPath}`);

        // 2. Simpan List Unique Types
        const typesList = Array.from(uniqueTypes).sort((a, b) => a - b);
        const typesJson = JSON.stringify(typesList, null, 2);
        const typePath = dataPath + "/unique_activity_types.json";
        const typeFile = new (File as any)(typePath, "w");
        typeFile.write(typesJson);
        typeFile.flush();
        typeFile.close();
        console.log(`[+] SUCCESS: Unique Activity Types saved to: ${typePath}`);
        console.log(`[!] Found ${typesList.length} unique activity types: ${typesList.join(", ")}`);
      }

      console.log("\n--- DUMP COMPLETE ---\n");
    } catch (e) {
      console.log("[-] Dump Error: " + e);
    }
  };

  // ==========================================
  // ACTIVITY DATA COLLECTION (Dynamic)
  // ==========================================
  const dynamicActivitiesMap = new Map<string, any>();
  const dynamicUniqueTypes = new Set<number>();

  /**
   * Fungsi untuk menyimpan hasil dump dinamis ke JSON
   */
  const saveDynamicDump = () => {
    try {
      if (dynamicActivitiesMap.size === 0) return;

      const dataPath = Il2Cpp.application.dataPath;
      if (!dataPath) return;

      const activities = Array.from(dynamicActivitiesMap.values())
        .sort((a, b) => Number(a.id) - Number(b.id));

      const types = Array.from(dynamicUniqueTypes).sort((a, b) => a - b);

      // 1. Simpan Dynamic Activity Dump
      const activityJson = JSON.stringify(activities, null, 2);
      const actPath = dataPath + "/dynamic_activities_dump.json";
      const actFile = new (File as any)(actPath, "w");
      actFile.write(activityJson);
      actFile.flush();
      actFile.close();

      // 2. Simpan Unique Types dari Dynamic Dump
      const typesJson = JSON.stringify(types).replace(/,/g, ", ");
      const typePath = dataPath + "/dynamic_unique_types.json";
      const typeFile = new (File as any)(typePath, "w");
      typeFile.write(typesJson);
      typeFile.flush();
      typeFile.close();

      console.log(`[+] Auto-Dump: ${activities.length} dynamic activities & ${types.length} types saved.`);
    } catch (e) { }
  };

  // Simpan hasil dump dinamis setiap 20 detik jika ada data baru
  setInterval(saveDynamicDump, 20000);

  // ==========================================
  // ACTIVITY PROTOCOL OVERRIDE (Dynamic)
  // ==========================================
  const CmdActivityDataClass = Toolkit.findClass("MTTDProto.CmdActivityData") || Toolkit.findClass("CmdActivityData");
  if (CmdActivityDataClass) {
    const visitMethods = CmdActivityDataClass.methods.filter(m => m.name === "visit");

    visitMethods.forEach(method => {
      const originalVisitAddr = method.virtualAddress;
      method.implementation = function (...args: any[]) {
        // Panggil fungsi asli agar data terisi dari Sdp (Server)
        const originalVisit = new NativeFunction(originalVisitAddr, "void", ["pointer", "pointer", "int"]) as any;
        originalVisit(this.handle, args[0].handle, args[1] ? 1 : 0);

        const instance = this as Il2Cpp.Object;

        // --- DATA COLLECTION (Ambil data sebelum dimodifikasi) ---
        try {
          const rawId = instance.field("iActivityId").value;
          const rawType = Number(instance.field("iActivityType").value);
          const rawTitle = instance.field("sTitle").value;
          const idStr = rawId.toString();

          if (!dynamicActivitiesMap.has(idStr)) {
            dynamicUniqueTypes.add(rawType);
            dynamicActivitiesMap.set(idStr, {
              id: rawId,
              type: rawType,
              title: rawTitle instanceof Il2Cpp.String ? rawTitle.content : null,
              jumpUI: (instance.field("sJumpUI").value as any) instanceof Il2Cpp.String ? (instance.field("sJumpUI").value as any).content : null,
              beginTime: instance.field("iBeginTime").value,
              endTime: instance.field("iEndTime").value,
            });
          }
        } catch (e) { }

        const originalType = Number(instance.field("iActivityType").value);
        const originalId = instance.field("iActivityId").value.toString();

        // --- STEP 1: Terapkan Global NOP Default ---
        if (useGlobalNop) {
          for (const [field, value] of Object.entries(globalNopConfig)) {
            try {
              (instance.field(field) as any).value = value;
            } catch (e) { /* Field mungkin tidak ada di versi ini */ }
          }
        }

        let isModified = false;

        // --- STEP 2: Terapkan Whitelist (Type-based) ---
        if (typesToOverride.includes(originalType)) {
          // Kembalikan tipe aslinya jika ada di whitelist
          (instance.field("iActivityType") as any).value = originalType;

          // Terapkan config "Active" untuk whitelist
          for (const [field, value] of Object.entries(whitelistedTypeConfig)) {
            try {
              (instance.field(field) as any).value = value;
            } catch (e) { }
          }
          isModified = true;
        }

        // --- STEP 3: Terapkan Custom Override (ID-based) ---
        if (idSpecificOverrides[originalId]) {
          const config = idSpecificOverrides[originalId];
          for (const [field, value] of Object.entries(config)) {
            try {
              if (typeof value === "string") {
                (instance.field(field) as any).value = Il2Cpp.string(value);
              } else {
                (instance.field(field) as any).value = value;
              }
            } catch (e) { }
          }
          isModified = true;
        }

        if (isModified) {
          // console.log(`[⚡ ACTIVITY] Customized ID ${originalId} (Type: ${originalType})`);
        }
      };
    });
  }

  // Panggil dump aktivitas otomatis setelah 15 detik (memberi waktu data loading)
  setTimeout(() => {
    dumpActivities();
  }, 15000);
});

