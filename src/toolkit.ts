import "frida-il2cpp-bridge";

export const Toolkit = {
  /**
   * Force a method to always return a specific value across all assemblies.
   */
  hookMethodReturn(className: string, methodName: string, forceReturn: any) {
    try {
      const klass = this.findClass(className);
      if (!klass) {
        console.log(`[-] Error: Class '${className}' not found in any assembly.`);
        return;
      }
      const method = klass.method(methodName);
      method.implementation = function () {
        return forceReturn;
      };
      console.log(`[+] Success: Method '${methodName}' in class '${className}' forced to return: ${forceReturn}.`);
    } catch (e) {
      console.log(`[-] Error hooking ${className}::${methodName}: ${e}`);
    }
  },

  /**
   * Block a method from executing its body across all assemblies.
   */
  blockMethod(className: string, methodName: string) {
    try {
      const klass = this.findClass(className);
      if (!klass) {
        console.log(`[-] Error: Class '${className}' not found in any assembly.`);
        return;
      }
      const method = klass.method(methodName);
      method.implementation = function () {
        // No-op
      };
      console.log(`[X] Setter Blocked: ${className}::${methodName}`);
    } catch (e) {
      console.log(`[-] Error blocking ${className}::${methodName}: ${e}`);
    }
  },

  /**
   * Trace all method calls in a class across all assemblies.
   */
  traceMethodCalls(className: string) {
    try {
      const klass = this.findClass(className);
      if (!klass) {
        console.log(`[-] Error: Class '${className}' not found in any assembly.`);
        return;
      }
      Il2Cpp.trace().classes(klass).and().attach();
      console.log(`[*] Simple Trace Active: Monitoring '${className}'`);
    } catch (e) {
      console.log(`[-] Error tracing ${className}: ${e}`);
    }
  },

  /**
   * Find a class by name across all assemblies.
   */
  findClass(name: string) {
    for (const assembly of Il2Cpp.domain.assemblies) {
      const klass = assembly.image.tryClass(name);
      if (klass) return klass;
    }
    return null;
  },

  /**
   * Game Guardian Style Memory Scanner
   */
  GGScanner: {
    results: [] as NativePointer[],
    search(value: number) {
      this.results = [];
      const ranges = Process.enumerateRanges({ protection: 'rw-', coalesce: true });
      const pattern = value.toString(16).padStart(8, '0').match(/.{1,2}/g)?.reverse().join(' ') || "";

      ranges.forEach(r => {
        try {
          Memory.scanSync(r.base, r.size, pattern).forEach(m => this.results.push(m.address));
        } catch (e) { }
      });
      console.log(`[+] GG: Found ${this.results.length} addresses for value ${value}.`);
    },
    modify(newValue: number) {
      let count = 0;
      this.results.forEach(addr => {
        try {
          addr.writeInt(newValue);
          count++;
        } catch (e) { }
      });
      console.log(`[+] GG: Successfully modified ${count} addresses!`);
    }
  },

  /**
   * Interaction with Unity GameObjects
   */
  Unity: {
    forceClick(targetName: string) {
      try {
        const GameObject = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.GameObject");
        const findMethod = GameObject.method("Find");
        const sendMsgMethod = GameObject.method("SendMessage", 1);

        const go = findMethod.invoke(Il2Cpp.string(targetName)) as Il2Cpp.Object;
        if (!go.isNull()) {
          sendMsgMethod.invoke(go, Il2Cpp.string("OnClick"));
          console.log(`[🚀] SUCCESS: Force clicked GameObject "${targetName}"`);
        } else {
          console.log(`[!] FAILED: GameObject "${targetName}" not found.`);
        }
      } catch (e) {
        console.log(`[!] Error in forceClick: ${e}`);
      }
    },

    trackStatus(targetObjName: string) {
      try {
        const GameObject = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.GameObject");
        const setActive = GameObject.method("SetActive");
        const getName = GameObject.method("get_name");

        setActive.implementation = function (state: any) {
          const name = (getName.invoke(this as any) as Il2Cpp.String).content;
          if (name && name.toLowerCase().includes(targetObjName.toLowerCase())) {
            console.log(`\n[🎯 TARGET DETECTED] GameObject: ${name} | State: ${state}`);
            if (state === 0 || state === false) {
              console.log(`[!] Forcing Active (True)!`);
              return setActive.invoke(this as any, 1 as any);
            }
          }
          return setActive.invoke(this as any, state);
        };
        console.log(`[+] GameObject Tracker active for: ${targetObjName}`);
      } catch (e) {
        console.log(`[!] Error in trackStatus: ${e}`);
      }
    },

    replaceUIText(searchString: string, replaceString: string) {
      try {
        // Common UI text methods in Unity
        const targetMethods = ["set_text", "set_Text", "set_content", "SetText"];

        Il2Cpp.domain.assemblies.forEach(assembly => {
          assembly.image.classes.forEach(klass => {
            klass.methods.forEach(method => {
              if (targetMethods.includes(method.name)) {
                const originalImplementation = method.implementation;
                method.implementation = function (text: any) {
                  if (text instanceof Il2Cpp.String) {
                    const content = text.content;
                    if (content && content.toLowerCase().includes(searchString.toLowerCase())) {
                      return method.invoke(this as any, Il2Cpp.string(replaceString));
                    }
                  }
                  return method.invoke(this as any, text);
                };
              }
            });
          });
        });
        console.log(`[*] Text Replacer Ready: "${searchString}" -> "${replaceString}"`);
      } catch (e) {
        console.log(`[-] Error setting up Text Replacer: ${e}`);
      }
    }
  },

  /**
   * Search for classes that contain specific field keywords.
   */
  findDataModel(keywords: string[]) {
    console.log(`[*] Searching for data models containing: ${keywords.join(", ")}`);
    const matches: { className: string, count: number }[] = [];

    Il2Cpp.domain.assemblies.forEach(assembly => {
      assembly.image.classes.forEach(klass => {
        let count = 0;
        klass.fields.forEach(field => {
          keywords.forEach(kw => {
            if (field.name.toLowerCase().includes(kw.toLowerCase())) count++;
          });
        });
        if (count > 0) matches.push({ className: klass.fullName, count });
      });
    });

    matches.sort((a, b) => b.count - a.count).slice(0, 10).forEach(m => {
      console.log(`[Rank] Class ${m.className} matched ${m.count} keywords.`);
    });
  }
};
