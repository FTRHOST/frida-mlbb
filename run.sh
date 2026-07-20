#!/bin/bash

echo "[*] Menunggu sub-proses UnityKillsMe..."

# Loop terus-menerus untuk memantau dan menempelkan Frida kembali jika game direstart
while true; do
  PID=$(adb shell ps -A | grep ":UnityKillsMe" | awk '{print $2}')

  if [ ! -z "$PID" ]; then
    echo "[+] Menemukan UnityKillsMe dengan PID: $PID. Menjalankan Frida..."
    sleep 3
    frida -U -p $PID -l dist/agent.js
    echo "[*] Frida terputus/selesai. Menunggu proses baru..."
  fi

  # Jeda 1 detik sebelum mengecek kembali agar tidak membebani CPU
  sleep 1
done
