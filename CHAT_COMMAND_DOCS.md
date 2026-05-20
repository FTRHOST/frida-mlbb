# MLBB Chat Command & SystemTip Implementation Guide (C++)

This document provides technical details for implementing a chat-based command prompt and native system tips in a C++ mod for MLBB.

---

## 1. Chat Command Interception

The game processes chat history using the `BattleBridge` class. By hooking the method responsible for displaying chat text, we can intercept commands.

### Target Specification
- **Class:** `BattleBridge`
- **Method:** `void ShowChatHistoryText(System.String text)`
- **Namespace:** (Global)
- **Signature:** `void ShowChatHistoryText(void* instance, MonoString* text)`

### Implementation Logic
1. **Hooking**: Intercept `ShowChatHistoryText`.
2. **Re-entrancy Guard**: Use a static boolean to prevent infinite loops, as showing a tip might refresh the chat UI.
3. **Parsing**: Convert the `MonoString*` to a standard string and search for a prefix (e.g., `#`).
4. **Debouncing**: Store the last processed command string to avoid executing the same command multiple times if the history is re-rendered.

```cpp
// C++ Example logic
void (*old_ShowChatHistoryText)(void* instance, MonoString* text);

void hook_ShowChatHistoryText(void* instance, MonoString* text) {
    static bool isProcessing = false;
    static std::string lastCmd = "";

    if (isProcessing || !text) {
        return old_ShowChatHistoryText(instance, text);
    }

    std::string content = MonoStringToStdString(text);
    if (content.find("#") != std::string::npos) {
        // Extract command...
        if (extractedCmd != lastCmd) {
            lastCmd = extractedCmd;
            isProcessing = true;
            // Execute your mod logic here
            isProcessing = false;
        }
    }

    old_ShowChatHistoryText(instance, text);
}
```

---

## 2. Native System Tip (Popup)

`UISystemTip` is the standard dialog box used for notifications. It requires a `SystemTipData` object to define its content.

### Class: `SystemTipData`
This class holds the configuration for the popup.

| Field | Offset | Type | Description |
| :--- | :--- | :--- | :--- |
| `type` | `0x10` | `int` | Enum `eSystemTipType` (2 = SimpleTxt_Confirm) |
| `strTip` | `0x18` | `MonoString*` | The main message body |
| `strCmd` | `0x38` | `MonoString*` | Text for the 'Confirm/OK' button |
| `strCancel`| `0x40` | `MonoString*` | Text for the 'Cancel' button |

### Class: `UISystemTip`
The controller class for the popup.

| Member | Type | Signature / Offset | Description |
| :--- | :--- | :--- | :--- |
| `_install` | Static Field | `0x8` (static) | Static instance pointer |
| `get_Instance` | Method | `UISystemTip* ()` | Singleton accessor |
| `Active` | Method | `void (System.Object arg)` | Displays the popup using `SystemTipData` |
| `strTitile` | Field | `0x1a0` | The title of the popup window |

### Execution Flow (C++)
1. **Main Thread Only**: Ensure all calls are made on the Unity Main Thread.
2. **Object Creation**: Create a new `SystemTipData` object using `il2cpp_object_new`.
3. **Initialization**: Call the `.ctor()` for `SystemTipData`.
4. **Setup**: Assign values to `strTip`, `strCmd`, and `type`.
5. **Activation**: Get the `UISystemTip` instance and call `Active(data)`.

```cpp
void ShowNativeTip(const char* message, const char* title) {
    auto klassData = il2cpp_symbols::find_class("SystemTipData");
    auto klassUI = il2cpp_symbols::find_class("UISystemTip");

    // 1. Create Data
    void* data = il2cpp_functions::object_new(klassData);
    // Call constructor
    auto ctor = il2cpp_symbols::find_method(klassData, ".ctor", 0);
    il2cpp_functions::runtime_invoke(ctor, data, nullptr, nullptr);

    // 2. Set Fields
    *(MonoString**)((uintptr_t)data + 0x18) = il2cpp_functions::string_new(message);
    *(MonoString**)((uintptr_t)data + 0x38) = il2cpp_functions::string_new("OK");
    *(int*)((uintptr_t)data + 0x10) = 2; // SimpleTxt_Confirm

    // 3. Get UI Instance and Set Title
    auto getInstance = il2cpp_symbols::find_method(klassUI, "get_Instance", 0);
    void* instance = il2cpp_functions::runtime_invoke(getInstance, nullptr, nullptr, nullptr);
    
    *(MonoString**)((uintptr_t)instance + 0x1a0) = il2cpp_functions::string_new(title);

    // 4. Show
    auto activeMethod = il2cpp_symbols::find_method(klassUI, "Active", 1);
    void* params[] = { data };
    il2cpp_functions::runtime_invoke(activeMethod, instance, params, nullptr);
}
```

---

## 3. Reference Summary

| Goal | Relevant Symbols |
| :--- | :--- |
| **Command Entry** | `BattleBridge::ShowChatHistoryText` |
| **Popup Logic** | `UISystemTip::Active`, `SystemTipData` |
| **Safety** | Must run on **Main Thread**, use **Re-entrancy Guard**. |
