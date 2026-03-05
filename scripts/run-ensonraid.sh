#!/bin/bash
# Keeps ensonraid.py running forever — auto-restarts on crash
cd /Users/oscarbrendon/.openclaw/workspace/mission-control/scripts

export DISCORD_WEBHOOK_URL="WEBHOOK_URL_BURAYA"

while true; do
    echo "[$(date)] 🚀 ensonraid.py başlatıldı"
    python3 ensonraid.py >> /tmp/ensonraid.log 2>&1
    echo "[$(date)] ⚠️ Çöktü, 10 sn sonra yeniden başlıyor..."
    sleep 10
done
