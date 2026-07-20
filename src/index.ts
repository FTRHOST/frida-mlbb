import "frida-il2cpp-bridge";
import "./tool-leak.js";

// Set custom IL2CPP module name since MLBB uses liblogic.so instead of libil2cpp.so
Il2Cpp.$config.moduleName = "liblogic.so";
