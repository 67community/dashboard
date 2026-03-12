#!/usr/bin/env python3
"""
Export 5 random sessions as base64 for GitHub Secrets.
Run this once, copy output to GitHub → Settings → Secrets → Actions.

Usage:
    python3 export_sessions.py
"""
import json, base64, random
from pathlib import Path

SESSIONS_DIR = Path(__file__).parent.parent / "skills/67coin/assets/sessions"

sessions = list(SESSIONS_DIR.glob("session.*.json"))
if not sessions:
    print("No sessions found in", SESSIONS_DIR)
    exit(1)

random.shuffle(sessions)
pick = sessions[:5]

print("=" * 60)
print("Copy these to GitHub → Settings → Secrets → Actions")
print("=" * 60)
for i, sf in enumerate(pick, 1):
    data = json.load(open(sf))
    encoded = base64.b64encode(json.dumps(data).encode()).decode()
    print(f"\nSecret name : TWITTER_SESSION_{i}")
    print(f"Secret value: {encoded[:80]}...  ({len(encoded)} chars total)")
    # Save full value to a temp file for easy copy-paste
    out = Path(f"/tmp/session_{i}.txt")
    out.write_text(encoded)
    print(f"Full value  : cat {out}")

print("\n" + "=" * 60)
print("Also add these secrets (if not already set):")
print("  PROXY_SERVER = (from .env)")
print("  PROXY_USER   = (from .env)")
print("  PROXY_PASS   = (check .env file)")
print("=" * 60)
