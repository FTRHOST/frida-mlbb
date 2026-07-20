import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("Berhasill");
  const Assembly = Il2Cpp.domain.assembly("Assembly-CSharp").image
  const ChooseHeroMgr = Assembly.class("ChooseHeroMgr")

  ChooseHeroMgr.method("BActFreeSkin").implementation = function () {
    return true;
  }

})
