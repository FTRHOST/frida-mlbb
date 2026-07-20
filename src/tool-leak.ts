import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("Oke Nyambung");

  const asm = Il2Cpp.domain.assembly("Assembly-CSharp");
  const sd = asm.image.class("SystemData");
  const bb = asm.image.class("BattleBridge");
  const mmtb = asm.image.class("UIMiniMapToolButton");
  const chm = asm.image.class("ChooseHeroMgr");
  const uch = asm.image.class("UIChooseHero");
  const b_mtd = asm.image.class("Battle.MapTypeData");
  const gms = asm.image.class("GameServerConfig");
  const rd = asm.image.class("SystemData/RoomData");
  const UIMiniMapToolButton = asm.image.class("UIMiniMapToolButton");

  const sshsi = chm.method("SaveSelectHeroSkinId");
  const brm = asm.image.class("MTTDProto.BattlePlayerInfo");

  const LoginCLibraryUtils = asm.image.class("LoginCLibraryUtils");

  const initialSandBox =
    LoginCLibraryUtils.field<boolean>("mStaticIsSandBox").value;
  console.log(
    `[LoginCLibraryUtils] Initial mStaticIsSandBox: ${initialSandBox}`,
  );
  LoginCLibraryUtils.field("mStaticIsSandBox").value = true;

  const target = bb.method("SetMapRange");
  /*
    Interceptor.attach(target.virtualAddress, {
      onEnter(args: any) {
        console.log(`[ChooseHeroMgr::SendSelectSkin] ORIGINAL skinid: ${args[1].toInt32()}, heroid: ${args[2].toInt32()}`);
        // args[1] = ptr(0);
        // console.log(`[ChooseHeroMgr::SendSelectSkin] FORCED skinid to 0`);
      }
    });
  
    Interceptor.attach(sshsi.virtualAddress, {
      onEnter(args: any) {
        console.log(`sshsi: ${args[1].toInt32()}, ${args[2].toInt32()}`);
  
      }
    })
  */

  //
  //0xfffffffff3704154 ┌─SystemData::CheckCurMapSkinMatch
  // 0xfffffffff3703d00 │ ┌─SystemData::GetMapGroupByIndex
  // 0xfffffffff3703d00 │ └─SystemData::GetMapGroupByIndex
  // 0xfffffffff3703fc8 │ ┌─SystemData::IsCurrMapSKin
  // 0xfffffffff3703fc8 │ └─SystemData::IsCurrMapSKin
  // 0xfffffffff3704154 └─SystemData::CheckCurMapSkinMatch
  //
  //    -> [Static] m_ServerGroupInfos: System.Collections.Generic.List`1[MTTDProto.ServerGroupInfo]
  // -> [Static] m_ServerProxyInfos: System.Collections.Generic.List`1[MTTDProto.ProxyIpPort]
  // m_uiDamond: 1050
  // [Static] Hide3DCamera: true
  //
  // m_bEnableDownloadForce: false
  //
  // m_DisableHeros
  // m_sGmThisLoginCountry
  // GmChooseHeroData: 0
  //    -> [Static] GmChooseHeroSkin: 0
  //  -> [Static] GmAiChooseHeroData: null
  // -> [Static] GmAiChooseHeroSummonSkillIDs: null
  // -> [Static] m_towerMapChooseOpen: false
  // -> [Static] m_bNeedReportSoundSettingsWhenExitFromBattle: false
  // -> [Static] m_bSystemUnlockOpen: false
  //
  // [Method] DoSelectHero OnHeroSelected SetConfirmChooseHero

  //
  //

  //Il2Cpp.trace(true).methods(target).and().attach();
  Il2Cpp.trace(true).classes(UIMiniMapToolButton).and().attach();
  //
  /*sd.method("IsCanUseSkin").implementation = function (heroid) {
    return true;
  }

  chm.method("IsSkinUseable").implementation = function (skinId, bIgnoreOtherShare) {
    return true;
  };*/

  sd.field("m_uiDamond").value = 982732;
  sd.field("m_uiCoupons").value = 976473;
  sd.field("m_bEsportPlayer").value = true;

  const instanceGMS = Il2Cpp.gc.choose(gms);
  const objekAktifGMS = instanceGMS.length > 0 ? instanceGMS[0] : null;

  if (objekAktifGMS) {
    const gsdksandbox = objekAktifGMS.field<boolean>("m_bGSDKSandBox").value;
    const adjustsandbox =
      objekAktifGMS.field<boolean>("m_bAdjustSandBox").value;
    console.log(
      `[GameServerConfig] Initial m_bGSDKSandBox: ${gsdksandbox}, m_bAdjustSandBox: ${adjustsandbox}`,
    );
  }

  // objekAktifGMS.field("m_uiID").value = 9999;
  //
  gms.method("IsChannelTapTest").implementation = function () {
    const ori = this.method("IsChannelTapTest").invoke();
    const gsdksandbox = this.field<boolean>("m_bGSDKSandBox").value;
    const adjustsandbox = this.field<boolean>("m_bAdjustSandBox").value;
    console.log(
      `[GameServerConfig::IsChannelTapTest] Return: ${ori}, m_bGSDKSandBox: ${gsdksandbox}, m_bAdjustSandBox: ${adjustsandbox}`,
    );
    return ori;
  };

  /*
    const getBattlePlayerInfoMethod = sd.method("GetBattlePlayerInfo");
  
    // Definisikan tipe balikan dari implementation adalah Il2Cpp.Object
    getBattlePlayerInfoMethod.implementation = function (): Il2Cpp.Object {
      // 1. Berikan tipe <Il2Cpp.Object> pada saat invoke()
      const resultList = this.method<Il2Cpp.Object>("GetBattlePlayerInfo").invoke();
  
      if (!resultList.isNull()) {
        console.log("\n[*] Method GetBattlePlayerInfo terpanggil!");
  
        // 2. Berikan tipe pada field() agar TypeScript tahu kita mengekstrak number dan Il2Cpp.Array
        const size = resultList.field<number>("_size").value;
        const itemsArray = resultList.field<Il2Cpp.Array<Il2Cpp.Object>>("_items").value;
  
        console.log(`[*] Ditemukan ${size} RoomData di dalam List.`);
  
        for (let i = 0; i < size; i++) {
          const roomDataObj = itemsArray.get(i);
  
          if (!roomDataObj.isNull()) {
            try {
              // Casting return get_strName menjadi Il2Cpp.String
              const strNameObj = roomDataObj.method<Il2Cpp.String>("get_strName").invoke();
              const playerName = strNameObj.isNull() ? "Unknown" : strNameObj.content;
  
              // Field ini di C# bertipe 'object' (boxed), jadi kita ambil sebagai Il2Cpp.Object
              const uid = roomDataObj.field<Il2Cpp.Object>("lUid").value;
              const heroId = roomDataObj.field<Il2Cpp.Object>("heroid").value;
              const camp = roomDataObj.field<Il2Cpp.Object>("iCamp").value;
              const country = roomDataObj.field<Il2Cpp.Object>("country").value;
  
              console.log(`  [+] Index ${i} | Nama: "${playerName}" | UID: ${uid} | HeroID: ${heroId} | Camp: ${camp} | Negara: ${country}`);
            } catch (e: unknown) {
              // 3. Pengecekan tipe error untuk TS18046 ('e' is of type 'unknown')
              const errorMessage = e instanceof Error ? e.message : String(e);
              console.error(`  [!] Gagal membaca data pada index ${i}: ${errorMessage}`);
            }
          }
        }
      }
  
      return resultList;
    };
  
  */

  // sd.field("m_iUserMapSkinId").value = 10;
  //
  // const liat = sd.field("m_iMapSkinId").value;
  // console.log(liat);
  //
  //

  /*
    uch.method("CanSelectSkin").implementation = function (skinId, heroinfo) {
      return true;
    }
  */
  /*
    uch.method("SelectSkin").implementation = function (skinid) {
      const ori = this.method("SelectSkin").invoke(skinid);
      console.log("berikut adalah id player :", "skin: ", skinid);
      return ori;
    };
  
    uch.method("ChangeSkin").implementation = function (skinid) {
      console.log(skinid)
      return this.method("ChangeSkin").invoke(skinid);
    }*/

  console.log("Mencari objek");

  const instanceBB = Il2Cpp.gc.choose(bb);
  const objekAktifBB = instanceBB.length > 0 ? instanceBB[0] : null;

  const instanceMMTB = Il2Cpp.gc.choose(mmtb);
  const objekAktifMMTB = instanceMMTB.length > 0 ? instanceMMTB[0] : null;

  const instanceUIMiniMapToolButton = Il2Cpp.gc.choose(UIMiniMapToolButton);
  const objekAktifUIMiniMapToolButton = instanceUIMiniMapToolButton[0]!;

  // Fungsi global buatan Anda untuk menembak langsung dari konsol Frida
  (globalThis as any).showbar = function (bShow: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] showbar: ", bShow);

    // Panggil langsung menggunakan instance yang sudah disimpan DestroyAllBlood HideHeroBlood
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("HideHeroBlood").invoke(bShow);
    objekAktifUIMiniMapToolButton.method("SetVisible").invoke(bShow);
    objekAktifUIMiniMapToolButton.field("m_bGMButtonShown").value = false;
  };

  (globalThis as any).hideui = function () {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] ToggleAllUIShow ditekan");

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("ToggleAllUIShow").invoke();
  };

  (globalThis as any).minimaptoolbuttonshow = function (bShow: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Tampilkan mini map tool button: ", bShow);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("SetMinimapToolButtonShow").invoke(bShow);
  };

  (globalThis as any).showitem = function (bShow: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Tampilkan item shop direkomedasi: ", bShow);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("SetRecEquipShow").invoke(bShow);
  };

  (globalThis as any).showminimap = function (bShow: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Tampilkan minimap: ", bShow);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("SetMiniMapShow").invoke(bShow);
  };

  (globalThis as any).hidespell = function (bShow: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Sembunyikan spell: ", bShow);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("SetExtraSkillShow").invoke(bShow);
  };

  (globalThis as any).hidebuff = function (bShow: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Sembunyikan icon buff dsb.: ", bShow);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("SetKeySkillExtraShow").invoke(bShow);
  };

  (globalThis as any).hidename = function (bHide: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Sembunyikan nama: ", bHide);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("HideHeroNameAndFly").invoke(bHide);
  };

  (globalThis as any).showinfo = function (bShow: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Tampilkan item shop direkomedasi: ", bShow);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("SetBattleInfoShow").invoke(bShow);
  };

  (globalThis as any).freeskin = function (bool: boolean) {
    if (bool) {
      chm.method("BActFreeSkin").implementation = function (skinData) {
        return true;
      };
    } else {
      chm.method("BActFreeSkin").revert();
    }
  };

  (globalThis as any).test = function (bHide: boolean) {
    if (!objekAktifBB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Tampilkan item shop direkomedasi: ", bHide);

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifBB.method("SetJoyStickVisable").invoke(bHide);
  };

  (globalThis as any).test0 = function () {
    if (!objekAktifMMTB) {
      console.log(
        "[!] Gagal: Masuk ke arena battle terlebih dahulu agar instance terisi!",
      );
      return;
    }

    console.log("[*] Tampilkan item shop direkomedasi: ");

    // Panggil langsung menggunakan instance yang sudah disimpan
    // Parameter pertama: customCamp (integer dari Enum CampTypeB)
    objekAktifMMTB.method("OnGmOpenSetting").invoke();
  };

  (globalThis as any).liatsandbox = function () {
    const staticSandBox =
      LoginCLibraryUtils.field<boolean>("mStaticIsSandBox").value;
    console.log(`[LoginCLibraryUtils] mStaticIsSandBox: ${staticSandBox}`);

    try {
      const instance = gms.field<Il2Cpp.Object>("Instance").value;
      if (!instance.isNull()) {
        const gsdksandbox = instance.field<boolean>("m_bGSDKSandBox").value;
        const adjustsandbox = instance.field<boolean>("m_bAdjustSandBox").value;
        console.log(
          `[GameServerConfig.Instance] m_bGSDKSandBox: ${gsdksandbox}, m_bAdjustSandBox: ${adjustsandbox}`,
        );
        return;
      }
    } catch (e) {
      // Ignore and fallback to GC choose
    }

    try {
      const chooseGMS = Il2Cpp.gc.choose(gms);
      if (chooseGMS.length > 0) {
        const obj = chooseGMS[0]!;
        const gsdksandbox = obj.field<boolean>("m_bGSDKSandBox").value;
        const adjustsandbox = obj.field<boolean>("m_bAdjustSandBox").value;
        console.log(
          `[GC Choose] m_bGSDKSandBox: ${gsdksandbox}, m_bAdjustSandBox: ${adjustsandbox}`,
        );
      } else {
        console.log("[!] No GameServerConfig instance found.");
      }
    } catch (e: any) {
      console.log("[!] Error reading sandbox values: " + e.message);
    }
  };

  const CmdActivityData = asm.image
    .class("MTTDProto.CmdActivityData")
    .method("visit");
  Interceptor.attach(CmdActivityData.virtualAddress, {
    onEnter(args) {
      // Trace empty to fix crash
    },
  });
});
