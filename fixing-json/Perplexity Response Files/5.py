
# ─── C: skills-7-enrichment-patch.json  ──────────────────────────────────────
# Only the fields being ADDED are included per skill.
# Format: { "skillId": { "confusionGroupLabel": ..., "studentFocus": ..., "steps": [...] } }
# "steps" contains ONLY the new fields (detailedText, tagCategory, criticalCategory,
# examScorecard, phaseWord) keyed by step id.  Merge with existing skills-7.json.

import json

# Already built SKILLS_ENRICHED above; convert to a merge-ready patch format
patch = {}
for skill_id, skill_data in SKILLS_ENRICHED.items():
    steps_patch = {}
    for s in skill_data["steps"]:
        sid = s["id"]
        entry = {}
        for field in ("detailedText","tagCategory","criticalCategory","examScorecard","phaseWord"):
            if field in s and s[field] is not None:
                entry[field] = s[field]
        steps_patch[str(sid)] = entry
    patch[skill_id] = {
        "confusionGroupLabel": skill_data.get("confusionGroupLabel"),
        "studentFocus": skill_data.get("studentFocus"),
        "steps": steps_patch
    }

# Add the S14–S22 skills that weren't in SKILLS_ENRICHED dict (data from FINAL-PASS)
# These are generated with correct steps but not all captured in SKILLS_ENRICHED above.
# For completeness, add skeleton with confusionGroupLabel / studentFocus so the JSON
# shows what's needed and what's missing.

REMAINING_SKILLS = {
  "bed-bath-face-arm": {
    "confusionGroupLabel": "BATH-2 — also see partial-bed-bath. Face + one arm only; 28 steps.",
    "studentFocus": "Water temp check; gloves on; eyes inner-to-outer; no soap on face.",
    "note": "STEPS PRESENT IN FINAL-PASS S14 — port detailedText from that file"
  },
  "denture-care": {
    "confusionGroupLabel": None,
    "studentFocus": "Line sink; handle dentures over washcloth; rinse with cool water.",
    "note": "STEPS PRESENT IN FINAL-PASS S15 — port detailedText from that file"
  },
  "partial-bed-bath": {
    "confusionGroupLabel": "BATH-2 — also see bed-bath-face-arm. 24 steps; includes gown change.",
    "studentFocus": "Water temp check; change water for different body regions.",
    "note": "STEPS PRESENT IN FINAL-PASS S16 — port detailedText from that file"
  },
  "foot-care": {
    "confusionGroupLabel": None,
    "studentFocus": "Soak foot 5–10 min; dry between toes; lotion not between toes.",
    "note": "STEPS PRESENT IN FINAL-PASS S17 — port detailedText from that file"
  },
  "dress-weak-right-arm": {
    "confusionGroupLabel": "CLOTH-2 — also see knee-high-stocking. Dress weak arm first; undress strong arm first.",
    "studentFocus": "Dress affected arm first; undress unaffected arm first.",
    "note": "STEPS PRESENT IN FINAL-PASS S18 — port detailedText from that file"
  },
  "hand-and-nail-care": {
    "confusionGroupLabel": None,
    "studentFocus": "Soak hands; push back cuticles; dry between fingers.",
    "note": "STEPS PRESENT IN FINAL-PASS S19 — port detailedText from that file"
  },
  "oral-care-unconscious": {
    "confusionGroupLabel": "ORAL-2 — also see denture-care. HOB 30–45°; turn head to side; padded tongue depressor.",
    "studentFocus": "Turn head, keep airway clear; do not swallow.",
    "note": "STEPS PRESENT IN FINAL-PASS S20 — port detailedText from that file"
  },
  "perineal-care-female": {
    "confusionGroupLabel": None,
    "studentFocus": "41 steps; front-to-back; separate washcloth each stroke.",
    "note": "STEPS PRESENT IN FINAL-PASS S21 — port detailedText from that file"
  },
  "catheter-care-female": {
    "confusionGroupLabel": None,
    "studentFocus": "Clean 4 inches down catheter; never pull tubing.",
    "note": "STEPS PRESENT IN FINAL-PASS S22 — port detailedText from that file"
  },
}

for sid, sdata in REMAINING_SKILLS.items():
    patch[sid] = {
        "confusionGroupLabel": sdata.get("confusionGroupLabel"),
        "studentFocus": sdata.get("studentFocus"),
        "_importNote": sdata.get("note"),
        "steps": {}
    }

(out / "skills-7-enrichment-patch.json").write_text(
    json.dumps(patch, indent=2, ensure_ascii=False)
)
print("C written:", (out / "skills-7-enrichment-patch.json").stat().st_size, "bytes")
print("Skills in patch:", len(patch))