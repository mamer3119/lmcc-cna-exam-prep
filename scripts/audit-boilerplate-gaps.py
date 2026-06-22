#!/usr/bin/env python3
"""One-off audit: boilerplateId coverage vs expected bookend slots."""

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "data" / "skills.json"

with SKILLS.open(encoding="utf-8") as f:
    data = json.load(f)

counts = Counter()
missing = {"GLOVE_REMOVE": [], "CALL_LIGHT": [], "WATER_CHECK": [], "HAND_HYGIENE": []}

for skill in data["skills"]:
    n = skill["examSkillNumber"]
    slug = skill["slug"]
    for step in skill["steps"]:
        bid = step.get("boilerplateId")
        if bid:
            counts[bid] += 1
        text = step["text"].lower()
        sid = step["id"]
        if not bid:
            if "remove gloves" in text or ("glove" in text and "inside out" in text):
                missing["GLOVE_REMOVE"].append((n, slug, sid, step["text"][:70]))
            if "call light" in text:
                missing["CALL_LIGHT"].append((n, slug, sid, step["text"][:70]))
            if "water temperature" in text or "fill the basin" in text:
                missing["WATER_CHECK"].append((n, slug, sid, step["text"][:70]))
            if "hand hygiene" in text and "remove gloves" in text:
                missing["HAND_HYGIENE"].append((n, slug, sid, step["text"][:70]))

print("boilerplateId totals:", sum(counts.values()))
for k in sorted(counts):
    print(f"  {k}: {counts[k]}")

for label, rows in missing.items():
    if rows:
        print(f"\n{label} without boilerplateId:")
        for row in rows:
            print(f"  skill {row[0]} ({row[1]}) step {row[2]}: {row[3]}")
