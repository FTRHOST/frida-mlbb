import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("[*] IL2CPP tersambung. Menginisialisasi Spoofing V8 (Final Stable)...");

  try {
    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;

    // Inisialisasi Kelas
    const SystemData = AssemblyCSharp.class("SystemData");
    const CmdHeroSkin = AssemblyCSharp.class("MTTDProto.CmdHeroSkin");
    const CmdHeroStatue = AssemblyCSharp.class("MTTDProto.CmdHeroStatue");
    const ChooseHeroMgr = AssemblyCSharp.class("ChooseHeroMgr");
    const UIChooseHero = AssemblyCSharp.class("UIChooseHero");
    const BattleReceiveMessage = AssemblyCSharp.class("BattleReceiveMessage");
    const UIRankHero = AssemblyCSharp.class("UIRankHero");
    const ChangeShow = AssemblyCSharp.class("UIRankHero/ChangeShow");

    // Variabel Global
    let m_HeroID: number = 0;
    let m_SkinID: number = 0;
    // let m_StatueID: number = 0;
    //
    Il2Cpp.trace(false).classes(UIRankHero).and().attach();

    const getUiID = (): string => {
      try {
        const val = SystemData.field("m_uiID").value;
        if (val !== null && val !== undefined) return val.toString();
      } catch (e) {
        try {
          const instances = Il2Cpp.gc.choose(SystemData);
          if (instances && instances.length > 0 && instances[0]) {
            const iVal = instances[0].field("m_uiID").value;
            if (iVal !== null && iVal !== undefined) return iVal.toString();
          }
        } catch (e2) { }
      }
      return "0";
    };
    /*
        // ==========================================
        // 1. FAKE OWNERSHIP (Local Visual Only)
        // ==========================================
    
        SystemData.method("GetHeroSkin").implementation = function (m_heroskins: any, skinid: any): any {
          const ret = this.method("GetHeroSkin").invoke(m_heroskins, skinid) as Il2Cpp.Object;
          if (!ret.handle.isNull() && ret.handle.toInt32() > 0x100) return ret;
          const instance = CmdHeroSkin.alloc();
          instance.method(".ctor").invoke();
          instance.field("iId").value = skinid as any;
          instance.field("iLimitTime").value = 0;
          instance.field("iSource").value = 0;
          return instance;
        };
    
        SystemData.method("IsHaveSkin").implementation = function (skinid: any): any {
          const ret = this.method("IsHaveSkin").invoke(skinid) as Il2Cpp.Object;
          if (!ret.handle.isNull() && ret.handle.toInt32() > 0x100) return ret;
          const instance = CmdHeroSkin.alloc();
          instance.method(".ctor").invoke();
          instance.field("iId").value = skinid as any;
          instance.field("iLimitTime").value = 0;
          instance.field("iSource").value = 0;
          return instance;
        };
    
        SystemData.method("IsHaveSkinForever").implementation = function (skinid: any): any {
          const ret = this.method("IsHaveSkinForever").invoke(skinid) as Il2Cpp.Object;
          if (!ret.handle.isNull() && ret.handle.toInt32() > 0x100) return ret;
          const instance = CmdHeroSkin.alloc();
          instance.method(".ctor").invoke();
          instance.field("iId").value = skinid as any;
          instance.field("iLimitTime").value = 0;
          instance.field("iSource").value = 0;
          return instance;
        };
    
        SystemData.method("IsCanUseSkin").implementation = function (): any { return true; };
        UIRankHero.method("BRankHeroCanUse").implementation = function (): any { return true; };
    
        SystemData.method("IsHaveStatue").implementation = function (statueid: any): any {
          const ret = this.method("IsHaveStatue").invoke(statueid) as Il2Cpp.Object;
          if (!ret.handle.isNull() && ret.handle.toInt32() > 0x100) return ret;
          const instance = CmdHeroStatue.alloc();
          instance.method(".ctor").invoke();
          instance.field("iId").value = statueid as any;
          instance.field("iLimitTime").value = 0;
          instance.field("iSource").value = 0;
          return instance;
        };
    
        SystemData.method("IsHaveStatueForever").implementation = function (statueid: any): any {
          const ret = this.method("IsHaveStatueForever").invoke(statueid) as Il2Cpp.Object;
          if (!ret.handle.isNull() && ret.handle.toInt32() > 0x100) return ret;
          const instance = CmdHeroStatue.alloc();
          instance.method(".ctor").invoke();
          instance.field("iId").value = statueid as any;
          instance.field("iLimitTime").value = 0;
          instance.field("iSource").value = 0;
          return instance;
        };
    
        SystemData.method("GetHeroHolyStatue").implementation = function (m_herostatues: any, statueid: any): any {
          const ret = this.method("GetHeroHolyStatue").invoke(m_herostatues, statueid) as Il2Cpp.Object;
          if (!ret.handle.isNull() && ret.handle.toInt32() > 0x100) return ret;
          const instance = CmdHeroStatue.alloc();
          instance.method(".ctor").invoke();
          instance.field("iId").value = statueid as any;
          instance.field("iLimitTime").value = 0;
          instance.field("iSource").value = 0;
          return instance;
        };
    */
    /*
    // ==========================================
    // 2. SERVER SPOOFING (Capture ID)
    // ==========================================
    //

    const sss = ChooseHeroMgr.method("SendSelectSkin");
    Interceptor.attach(sss.virtualAddress, {
      onEnter(args) {
        if (args && args[1] && args[2]) {
          const skinid = args[1].toInt32();
          const heroid = args[2].toInt32();
          if (skinid > 0) {
            m_SkinID = skinid;
            m_HeroID = heroid;
            console.log(`[Lobby] Memilih Skin: ${skinid}`);
          }
          args[1] = ptr(0);
        }
      }
    });

    const sus = ChangeShow.method("SendUseSkin");
    Interceptor.attach(sus.virtualAddress, {
      onEnter(args) {
        if (args && args[1]) {
          const skinid = args[1].toInt32();
          if (skinid > 0) {
            m_SkinID = skinid;
            try {
              const instance = new Il2Cpp.Object(args[0] as NativePointer);
              const heroid = instance.field("iSelfHero").value as any;
              if (heroid !== undefined && heroid !== null) {
                m_HeroID = typeof heroid === "number" ? heroid : heroid.toInt32();
              }
            } catch (e) { }
            console.log(`[Lobby] Memilih Skin (SendUseSkin): ${skinid}`);
          }
          args[1] = ptr(0);
        }
      }
    });

    const tsus = ChangeShow.method("TrySendUseSkin");
    Interceptor.attach(tsus.virtualAddress, {
      onEnter(args) {
        if (args && args[1]) {
          const skinid = args[1].toInt32();
          if (skinid > 0) {
            m_SkinID = skinid;
            try {
              const instance = new Il2Cpp.Object(args[0] as NativePointer);
              const heroid = instance.field("iSelfHero").value as any;
              if (heroid !== undefined && heroid !== null) {
                m_HeroID = typeof heroid === "number" ? heroid : heroid.toInt32();
              }
            } catch (e) { }
            console.log(`[Lobby] Memilih Skin (TrySendUseSkin): ${skinid}`);
          }
          args[1] = ptr(0);
        }
      }
    });

    const sust = ChangeShow.method("SendUseStatue");
    Interceptor.attach(sust.virtualAddress, {
      onEnter(args) {
        if (args && args[1]) {
          const statueid = args[1].toInt32();
          if (statueid > 0) {
            m_StatueID = statueid;
            try {
              const instance = new Il2Cpp.Object(args[0] as NativePointer);
              const heroid = instance.field("iSelfHero").value as any;
              if (heroid !== undefined && heroid !== null) {
                m_HeroID = typeof heroid === "number" ? heroid : heroid.toInt32();
              }
            } catch (e) { }
            console.log(`[Lobby] Memilih Statue (SendUseStatue): ${statueid}`);
          }
          args[1] = ptr(0);
        }
      }
    });

    const sshs = ChooseHeroMgr.method("SendSelectHolyStatue");
    Interceptor.attach(sshs.virtualAddress, {
      onEnter(args) {
        if (args && args[1] && args[2]) {
          const statueid = args[1].toInt32();
          const heroid = args[2].toInt32();
          if (statueid > 0) {
            m_StatueID = statueid;
            console.log(`[Lobby] Memilih Statue: ${statueid}`);
          }
          args[1] = ptr(0);
        }
      }
    });
*/
    // ==========================================
    // 3. UI FORCING
    // ==========================================



    UIChooseHero.method("SelectSkin").implementation = function (skinid: any) {
      console.log(skinid);
      m_SkinID = skinid;

      const ori = this.method("SelectSkin").invoke(skinid)

      return ori;
    }


    /*
    UIChooseHero.method("BatttleSelectSkin").implementation = function (uid: any, skinid: any): any {
      const myUiId = getUiID();
      if (uid.toString() === myUiId && m_SkinID > 0) {
        return this.method("BatttleSelectSkin").invoke(uid, m_SkinID);
      }
      return this.method("BatttleSelectSkin").invoke(uid, skinid);
    };


    UIChooseHero.method("OnEventBatttleSelectHolyStatue").implementation = function (uid: any, statueId: any): any {
      const myUiId = getUiID();
      if (uid.toString() === myUiId && m_StatueID > 0) {
        return this.method("OnEventBatttleSelectHolyStatue").invoke(uid, m_StatueID);
      }
      return this.method("OnEventBatttleSelectHolyStatue").invoke(uid, statueId);
    };

    UIRankHero.method("BatttleSelectSkin").implementation = function (uid: any, skinid: any): any {
      const myUiId = getUiID();
      if (uid.toString() === myUiId && m_SkinID > 0) {
        return this.method("BatttleSelectSkin").invoke(uid, m_SkinID);
      }
      return this.method("BatttleSelectSkin").invoke(uid, skinid);
    };
    */

    // ==========================================
    // 4. NATIVE BATTLE INJECTION (Anti-Crash)
    // ==========================================

    const setPlayerData = BattleReceiveMessage.method("SetPlayerData").overload("MTTDProto.BattlePlayerInfo", "System.UInt32");

    Interceptor.attach(setPlayerData.virtualAddress, {
      onEnter(args) {
        if (!args || !args[1]) return;
        const playerInfoHandle = args[1];

        if (playerInfoHandle.isNull() || playerInfoHandle.toInt32() < 0x1000) return;

        try {
          const info = new Il2Cpp.Object(playerInfoHandle);
          const lUid = info.field("lUid").value.toString();
          const myUiId = getUiID();

          if (lUid === myUiId && m_SkinID !== 0) {
            info.field("uiSkinId").value = m_SkinID;
            try { info.field("uiHeroSkinIDChoose").value = m_SkinID; } catch (e) { }
            console.log(`[BattleInject] Berhasil menyuntik Skin ${m_SkinID} ke UID ${lUid}`);
          }
        } catch (e) { }
      }
    });

    console.log("[+] Semua hook Spoofing V8 Berhasil Dipasang!");
  } catch (e: any) {
    console.log(`[!] Error Inisialisasi: ${e.message}`);
  }
});
