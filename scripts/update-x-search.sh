#!/bin/bash
# Runs x-search and writes results into data.json
cd /Users/oscarbrendon/.openclaw/workspace/mission-control

RECENT=$(python3 scripts/x-search.py recent 2>/dev/null)
POPULAR=$(python3 scripts/x-search.py popular 2>/dev/null)

if [ -z "$RECENT" ] || [ "$RECENT" = "[]" ]; then
  echo "x-search recent returned empty, skipping"
  exit 0
fi

# Merge into data.json using Python
python3 - <<PYEOF
import json, os

DATA_FILE = "/Users/oscarbrendon/.openclaw/workspace/mission-control/data.json"

recent  = $RECENT
popular = $POPULAR

# Load existing data.json
try:
    with open(DATA_FILE) as f:
        data = json.load(f)
except:
    data = {}

data["x_recent"]  = recent
data["x_popular"] = popular

with open(DATA_FILE, "w") as f:
    json.dump(data, f, ensure_ascii=False)

print(f"Updated data.json: {len(recent)} recent, {len(popular)} popular")
PYEOF
