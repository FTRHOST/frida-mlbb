import "frida-il2cpp-bridge";

Il2Cpp.$config.moduleName = "liblogic.so";

Il2Cpp.perform(() => {
  console.log("Terhubung");

  const asm = Il2Cpp.domain.assembly("Assembly-CSharp").image;

  const UIChooseHero = asm.class("UIChooseHero");

  const SetConfirmChooseHero = UIChooseHero.method("SetConfirmChooseHero");

  // Il2Cpp.trace(false).classes(UIChooseHero).and().attach();
  //
  Il2Cpp.trace(true).methods(SetConfirmChooseHero).and().attach();

  Interceptor.attach(SetConfirmChooseHero.virtualAddress, {
    onEnter (args) {
      args[2] = ptr(99)
    }
  })
})
