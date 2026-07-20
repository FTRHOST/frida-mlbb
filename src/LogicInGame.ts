import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("[*] Frida script loaded successfully.");

  const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;

  const ChooseHeroMgr = AssemblyCSharp.class("ChooseHeroMgr");
  const CompetitionData = AssemblyCSharp.class("CompetitionData");
  const ShowBattleControl = AssemblyCSharp.class("ShowBattleControl");
  const SystemData = AssemblyCSharp.class("SystemData");
  const LogicBattleManager = AssemblyCSharp.class("LogicBattleManager");
  const CData_MultiLanguage = AssemblyCSharp.class("CData_MultiLanguage");
  const OfflineModeGuide = AssemblyCSharp.class("OfflineModeGuide");

  let strategiesPrinted = false;

  // Helper function to resolve text/language translations by ID
  function getTranslation(msgId: number): string {
    try {
      if (CData_MultiLanguage && !CData_MultiLanguage.handle.isNull()) {
        const instance = CData_MultiLanguage.method("GetInstance").invoke() as Il2Cpp.Object;
        if (instance && !instance.handle.isNull()) {
          const element = instance.method("GetValue_ByID").invoke(msgId) as Il2Cpp.Object;
          if (element && !element.handle.isNull()) {
            const message = element.field("m_Message").value as Il2Cpp.String;
            if (message && !message.handle.isNull()) {
              return message.content || "";
            }
            const translation = element.field("m_Translation").value as Il2Cpp.String;
            if (translation && !translation.handle.isNull()) {
              return translation.content || "";
            }
          }
        }
      }
    } catch (e: any) {
      return `[Translation Error: ${e.message}]`;
    }
    return "";
  }

  // Helper function to query and log all strategies parsed in config
  function printAllStrategies() {
    try {
      if (SystemData && !SystemData.handle.isNull()) {
        const config = SystemData.field("m_ANext2025Config").value as Il2Cpp.Object;
        if (config && !config.handle.isNull()) {
          const strategyMap = config.field("m_mapNext2025Strategy").value as Il2Cpp.Object;
          if (strategyMap && !strategyMap.handle.isNull()) {
            console.log("\n[Next2025] --- DAFTAR SELURUH STRATEGI MAP DARI CONFIG ---");
            for (let i = 1; i <= 10; i++) {
              try {
                const strategy = strategyMap.method("get_Item").invoke(i) as Il2Cpp.Object;
                if (strategy && !strategy.handle.isNull()) {
                  const id = strategy.field("m_iId").value as number;
                  const tipMsgId = strategy.field("m_iTipMsgID").value as number;
                  const resolvedText = getTranslation(tipMsgId);
                  console.log(`  -> Strategy ID: ${id} | Name: "${resolvedText}"`);
                }
              } catch (e) {
                // Key not found in dictionary, ignore
              }
            }
            console.log("[Next2025] ---------------------------------------------\n");
          }
        }
      }
    } catch (e: any) {
      console.log(`[Next2025] Gagal memuat daftar strategi map: ${e.message}`);
    }
  }

  // Helper function to query Strategy details by Strategy ID (safely handles null config)
  function getStrategyInfo(mapId: number): string {
    try {
      if (SystemData && !SystemData.handle.isNull()) {
        const config = SystemData.field("m_ANext2025Config").value as Il2Cpp.Object;
        if (config && !config.handle.isNull()) {
          const strategyMap = config.field("m_mapNext2025Strategy").value as Il2Cpp.Object;
          if (strategyMap && !strategyMap.handle.isNull()) {
            const strategy = strategyMap.method("get_Item").invoke(mapId) as Il2Cpp.Object;
            if (strategy && !strategy.handle.isNull()) {
              const tipMsgId = strategy.field("m_iTipMsgID").value as number;
              const resolvedText = getTranslation(tipMsgId);
              return `Strategy ID: ${mapId} | Tip ID: ${tipMsgId} | Description: "${resolvedText}"`;
            }
          } else {
            return `Strategy ID: ${mapId} (m_mapNext2025Strategy is null)`;
          }
        } else {
          return `Strategy ID: ${mapId} (m_ANext2025Config is null)`;
        }
      }
    } catch (e: any) {
      return `[Strategy Error: ${e.message}]`;
    }
    return `Strategy ID: ${mapId} (No strategy details parsed)`;
  }

  // Check the active Next2025 Map ID
  function checkActiveMap() {
    try {
      let mapId = 0;

      // 1. Cek dari SystemData (saat di Lobby / Choose Hero)
      if (SystemData && !SystemData.handle.isNull()) {
        mapId = SystemData.field("m_iNext2025FeatureFromSystem").value as number;
      }

      // 2. Fallback ke ShowBattleControl (saat di dalam Game)
      if (mapId === 0 && ShowBattleControl && !ShowBattleControl.handle.isNull()) {
        mapId = ShowBattleControl.field("m_iNext2025MapID").value as number;
      }

      // Cetak semua strategi sekali saja saat pertama kali map aktif terdeteksi
      if (!strategiesPrinted) {
        printAllStrategies();
        strategiesPrinted = true;
      }

      console.log(`--------------------------------------------------`);
      console.log(`[Next2025] Active Map ID: ${mapId}`);
      if (mapId !== 0) {
        const details = getStrategyInfo(mapId);
        console.log(`[Next2025] Details: ${details}`);
      } else {
        console.log(`[Next2025] Varian map tidak aktif (Normal Map)`);
      }
      console.log(`--------------------------------------------------`);
    } catch (e: any) {
      console.log(`[Next2025] Error checking active map: ${e.message}`);
    }
  }

  // Hook SetNext2025FeatureFromSystem on SystemData
  if (SystemData && !SystemData.handle.isNull()) {
    (SystemData.method("SetNext2025FeatureFromSystem") as any).implementation = function (featureId: any) {
      console.log(`[Next2025] SetNext2025FeatureFromSystem CALLED with ID: ${featureId}`);
      this.method("SetNext2025FeatureFromSystem").invoke(featureId);
      checkActiveMap();
    };
  }

  // Hook getter methods on LogicBattleManager
  if (LogicBattleManager && !LogicBattleManager.handle.isNull()) {
    (LogicBattleManager.method("get_m_iNext2025Feature") as any).implementation = function () {
      const val = this.method("get_m_iNext2025Feature").invoke() as number;
      // console.log(`[Next2025] get_m_iNext2025Feature returned: ${val}`);
      return val;
    };

    (LogicBattleManager.method("get_HasNext2025Feature") as any).implementation = function () {
      const val = this.method("get_HasNext2025Feature").invoke() as boolean;
      console.log(`[Next2025] get_HasNext2025Feature returned: ${val}`);
      return val;
    };
  }

  // Hook OfflineModeGuide.PickRandomNext2025FeatureId to trace offline picking
  if (OfflineModeGuide && !OfflineModeGuide.handle.isNull()) {
    (OfflineModeGuide.method("PickRandomNext2025FeatureId") as any).implementation = function () {
      const id = this.method("PickRandomNext2025FeatureId").invoke() as number;
      console.log(`[Next2025] PickRandomNext2025FeatureId returned: ${id}`);
      return id;
    };
  }

  // Hook ChooseHeroMgr.BActFreeSkin (called during hero selection entrance)
  const BActFreeSkin = ChooseHeroMgr.method("BActFreeSkin");
  Interceptor.attach(BActFreeSkin.virtualAddress, {
    onEnter(args) {
      console.log("[+] Entering Hero Selection lobby. Checking NEXT 2025 Map...");
      checkActiveMap();
    },
    onLeave(retval: any) {
      retval.replace(1);
    },
  });

  // Trace CompetitionData lifecycle as before
  Il2Cpp.trace(true).classes(CompetitionData).and().attach();
});
