
import os, zipfile, json
from pathlib import Path

out = Path("/root/output/lmcc-code-additions")
out.mkdir(parents=True, exist_ok=True)

BP = {
  "INTRO_EXPLAIN":   "Introduce yourself by name and title, explain the procedure to the patient in clear, plain language, and obtain verbal consent before proceeding.",
  "HAND_HYGIENE":    "Perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water, or use an alcohol-based hand rub when hands are visibly clean.",
  "PRIVACY":         "Provide for patient privacy — close the curtain, door, or privacy screen.",
  "GLOVE_DON":       "Don clean, non-sterile gloves.",
  "GLOVE_REMOVE":    "Remove gloves by turning them inside out — grasp the outside of one glove at the wrist and peel it off, then slide the fingers of the ungloved hand under the remaining glove at the wrist and peel it off turning inside out. Dispose of both gloves without touching the outer surface.",
  "CALL_LIGHT":      "Place the call light or signaling device within reach and confirm the patient knows how to use it.",
  "BED_LOW":         "Lower the bed to its lowest position and verify the bed brakes are locked.",
}

# A: checklist-step-2.ts
ts_a = '''\
// checklist-step-2.ts — extended with FINAL-PASS columns
// Drop-in replacement. No existing field removed or renamed.

export type StepSegment = "open" | "core" | "close";
export type BoilerplateId = "INTRO_IDENTIFY"|"INTRO_EXPLAIN"|"PRIVACY"|"HAND_HYGIENE"|"GLOVE_DON"|"GLOVE_REMOVE"|"GLOVE_REMOVE_THEN_HH"|"CALL_LIGHT"|"BED_LOW"|"WATER_CHECK";
export type CompoundBoilerplateId = "BED_LOW|CALL_LIGHT";

export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
  segment?: StepSegment;
  boilerplateId?: BoilerplateId | CompoundBoilerplateId | (string & {});

  // New fields from FINAL-PASS 11-column tables
  detailedText?: string;        // "Detailed Tag Text" — full GWC rubric language
  tagCategory?: string;         // "Tag Category"    — Opening | Key Procedure | Core | Closing
  criticalCategory?: string;    // "Critical Category" — hand-hygiene | privacy | bed-call-light
  examScorecard?: string;       // "Exam Scorecard"  — yellow badge text on scored steps
  phaseWord?: string;           // "Phase Word"      — override computed phase label
};
'''
(out / "checklist-step-2.ts").write_text(ts_a)

# B: skillCurriculum-6-patch.ts
ts_b = '''\
// skillCurriculum-6-patch.ts
// Wires getPhaseWordForStep() to per-step phase badge rendering.
// Import alongside skillCurriculum-6.ts.

import { getPhaseWordForStep } from "./skillCurriculum-6";
import type { ChecklistStep, StepSegment } from "./checklist-step-2";

export const PHASE_COLORS: Record<string, string> = {
  // OPEN
  Approach:"#3B82F6", Prepare:"#3B82F6", Identify:"#3B82F6", Introduce:"#3B82F6",
  // CORE task words
  Wash:"#F59E0B", Measure:"#F59E0B", Weigh:"#F59E0B", Transfer:"#F59E0B",
  Position:"#F59E0B", Ambulate:"#F59E0B", Shoulder:"#F59E0B", Lower:"#F59E0B",
  Apply:"#F59E0B", Bathe:"#F59E0B", Don:"#F59E0B", Doff:"#F59E0B",
  Foot:"#F59E0B", Hand:"#F59E0B", Dress:"#F59E0B", Oral:"#F59E0B",
  Peri:"#F59E0B", Catheter:"#F59E0B", Count:"#F59E0B",
  // Late-CORE (darker amber)
  Secure:"#D97706", Finish:"#D97706", Clean:"#D97706",
  // CLOSE
  Record:"#10B981", Work:"#10B981",
};

const FALLBACK: Record<StepSegment, string> = {
  open:"#3B82F6", core:"#F59E0B", close:"#10B981",
};

export function getStepPhaseColor(step: ChecklistStep, skillId: string): string {
  const word = step.phaseWord ?? getPhaseWordForStep(skillId, step.id) ?? step.segment;
  return (word && PHASE_COLORS[word]) ?? FALLBACK[step.segment ?? "core"];
}

export function getStepPhaseLabel(step: ChecklistStep, skillId: string): string {
  const w = step.phaseWord ?? getPhaseWordForStep(skillId, step.id);
  if (w) return w;
  return step.segment ? step.segment.charAt(0).toUpperCase() + step.segment.slice(1) : "";
}

/*
USAGE in step-row JSX:
  import { getStepPhaseLabel, getStepPhaseColor } from "./skillCurriculum-6-patch";
  <span style={{ background: getStepPhaseColor(step, skillId) }}>
    {getStepPhaseLabel(step, skillId)}
  </span>
*/
'''
(out / "skillCurriculum-6-patch.ts").write_text(ts_b)

# C: skills-7-enrichment-patch.json (abbreviated to core 13 skills, stubs for 9)
PATCH = {}

# S05 – manual-blood-pressure (14 steps)
PATCH["manual-blood-pressure"] = {
  "confusionGroupLabel": None,
  "studentFocus": "Cuff on bare skin; cleanse equipment; document both values ±8 mmHg.",
  "steps": {
    "1":  {"detailedText":BP["INTRO_EXPLAIN"],"tagCategory":"Opening","phaseWord":"Prepare"},
    "2":  {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Prepare","criticalCategory":"hand-hygiene"},
    "3":  {"detailedText":"Cleanse the stethoscope and blood pressure cuff prior to placing on patient skin.","tagCategory":"Core","phaseWord":"Prepare"},
    "4":  {"detailedText":"Place the patient in a relaxed seated position. Ask which arm they prefer. Arm supported at heart level.","tagCategory":"Core","phaseWord":"Prepare"},
    "5":  {"detailedText":"Remove or rearrange clothing so cuff and stethoscope are on bare skin.","tagCategory":"Core","phaseWord":"Measure"},
    "6":  {"detailedText":"Center the cuff bladder over the brachial artery, lower margin 1\" above the antecubital space.","tagCategory":"Core","phaseWord":"Measure"},
    "7":  {"detailedText":"Inflate the cuff to 160–180 mmHg.","tagCategory":"Core","phaseWord":"Measure","examScorecard":"Technique: Inflate cuff 160–180 mmHg"},
    "8":  {"detailedText":"Deflate at 2–3 mmHg/second; note the first Korotkoff sound as systolic.","tagCategory":"Core","phaseWord":"Measure","examScorecard":"Technique: Deflate rate 2–3 mmHg/second (systolic)"},
    "9":  {"detailedText":"Continue deflating at 2 mmHg/second; note when sounds disappear as diastolic.","tagCategory":"Core","phaseWord":"Measure","examScorecard":"Technique: Deflate rate 2 mmHg/second (diastolic)"},
    "10": {"detailedText":"Deflate completely and remove the cuff.","tagCategory":"Core","phaseWord":"Measure"},
    "11": {"detailedText":"Inform the patient of the blood pressure reading.","tagCategory":"Core","phaseWord":"Measure"},
    "12": {"detailedText":"Cleanse the stethoscope and cuff.","tagCategory":"Core","phaseWord":"Record"},
    "13": {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Record","criticalCategory":"hand-hygiene"},
    "14": {"detailedText":"Document both systolic and diastolic each within ±8 mmHg of evaluator reading.","tagCategory":"Closing","phaseWord":"Record","examScorecard":"Exam tolerance: Document BP ±8 mmHg (systolic AND diastolic)"},
  }
}

# S06 – weight-ambulatory-client (13 steps)
PATCH["weight-ambulatory-client"] = {
  "confusionGroupLabel": None,
  "studentFocus": "Zero scale; nonskid footwear; document ±2 lbs.",
  "steps": {
    "1":  {"detailedText":BP["INTRO_EXPLAIN"],"tagCategory":"Opening","phaseWord":"Prepare"},
    "2":  {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Prepare","criticalCategory":"hand-hygiene"},
    "3":  {"detailedText":"Verify the patient is wearing nonskid footwear.","tagCategory":"Core","phaseWord":"Prepare"},
    "4":  {"detailedText":"Balance (zero) the scale.","tagCategory":"Core","phaseWord":"Prepare"},
    "5":  {"detailedText":"Walk the patient to the scale.","tagCategory":"Core","phaseWord":"Weigh"},
    "6":  {"detailedText":"Assist the patient to step on the scale.","tagCategory":"Core","phaseWord":"Weigh"},
    "7":  {"detailedText":"Check the patient is centered on the scale.","tagCategory":"Core","phaseWord":"Weigh"},
    "8":  {"detailedText":"Check that the patient has arms at their side.","tagCategory":"Core","phaseWord":"Weigh"},
    "9":  {"detailedText":"Ensure the patient is not holding anything that would alter the weight.","tagCategory":"Core","phaseWord":"Weigh"},
    "10": {"detailedText":"Adjust weights until the scale is in balance.","tagCategory":"Core","phaseWord":"Weigh"},
    "11": {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Closing","phaseWord":"Record"},
    "12": {"detailedText":"Document weight within plus/minus 2 lbs. or 0.9 kg.","tagCategory":"Closing","phaseWord":"Record","examScorecard":"Exam tolerance: Document weight ±2 lb / 0.9 kg"},
    "13": {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Record","criticalCategory":"hand-hygiene"},
  }
}

# S07 – urinary-output-measurement (11 steps)
PATCH["urinary-output-measurement"] = {
  "confusionGroupLabel": None,
  "studentFocus": "Gloves on before pouring; measure at eye level on flat surface; ±25 mL.",
  "steps": {
    "1":  {"detailedText":BP["INTRO_EXPLAIN"],"tagCategory":"Opening","phaseWord":"Prepare"},
    "2":  {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Prepare","criticalCategory":"hand-hygiene"},
    "3":  {"detailedText":BP["GLOVE_DON"],"tagCategory":"Key Procedure","phaseWord":"Prepare"},
    "4":  {"detailedText":"Pour the liquid in the bedpan into a measuring container.","tagCategory":"Core","phaseWord":"Measure"},
    "5":  {"detailedText":"Rinse the bedpan and empty into the toilet.","tagCategory":"Core","phaseWord":"Measure"},
    "6":  {"detailedText":"Measure at eye level with container on a flat surface.","tagCategory":"Core","phaseWord":"Measure"},
    "7":  {"detailedText":"Empty urine into the toilet.","tagCategory":"Core","phaseWord":"Measure"},
    "8":  {"detailedText":"Rinse the measuring container and empty into the toilet.","tagCategory":"Core","phaseWord":"Measure"},
    "9":  {"detailedText":BP["GLOVE_REMOVE"],"tagCategory":"Key Procedure","phaseWord":"Record"},
    "10": {"detailedText":"Record volume within ±25 mL of actual.","tagCategory":"Closing","phaseWord":"Record","examScorecard":"Exam tolerance: Record volume ±25 mL"},
    "11": {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Record","criticalCategory":"hand-hygiene"},
  }
}

# S08 – position-on-side (24 steps)
pos_steps = {
  "1": {"detailedText":BP["INTRO_EXPLAIN"],"tagCategory":"Opening","phaseWord":"Approach"},
  "2": {"detailedText":BP["PRIVACY"],"tagCategory":"Opening","phaseWord":"Approach","criticalCategory":"privacy"},
  "3": {"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Approach","criticalCategory":"hand-hygiene"},
  "4": {"detailedText":"Position the bed flat.","tagCategory":"Core","phaseWord":"Position"},
  "5": {"detailedText":"Raise the bed height.","tagCategory":"Core","phaseWord":"Position"},
  "6": {"detailedText":"Raise the side rail on the side the patient will face.","tagCategory":"Core","phaseWord":"Position"},
  "7": {"detailedText":"Move to the working side (opposite the raised rail).","tagCategory":"Core","phaseWord":"Position"},
  "8": {"detailedText":"Explain you will move them closer before turning on count three.","tagCategory":"Core","phaseWord":"Position"},
  "9": {"detailedText":"Count to three and move patient toward you.","tagCategory":"Core","phaseWord":"Position"},
  "10":{"detailedText":"Instruct patient to move arm closest to rail away from body.","tagCategory":"Core","phaseWord":"Position"},
  "11":{"detailedText":"Raise the patient's near knee to assist turning.","tagCategory":"Core","phaseWord":"Position"},
  "12":{"detailedText":"Explain you will turn patient toward side rail on count three.","tagCategory":"Core","phaseWord":"Position"},
  "13":{"detailedText":"Count to three; turn patient toward side rail.","tagCategory":"Core","phaseWord":"Position"},
  "14":{"detailedText":"Ensure face never comes close to rail or is covered by pillow.","tagCategory":"Core","phaseWord":"Position"},
  "15":{"detailedText":"Check patient is not lying on bottom arm.","tagCategory":"Core","phaseWord":"Position"},
  "16":{"detailedText":"Place pillow behind back so patient won't roll supine.","tagCategory":"Core","phaseWord":"Position"},
  "17":{"detailedText":"Go to bed end; check body alignment.","tagCategory":"Core","phaseWord":"Position"},
  "18":{"detailedText":"Verify patient is in middle of bed.","tagCategory":"Core","phaseWord":"Position"},
  "19":{"detailedText":"Place pillow between top arm and rib cage; elbow not directly on ribs.","tagCategory":"Core","phaseWord":"Secure"},
  "20":{"detailedText":"Place pillow under top knee; knee not on other knee; ankles not touching.","tagCategory":"Core","phaseWord":"Secure"},
  "21":{"detailedText":"Adjust head pillow for comfort.","tagCategory":"Core","phaseWord":"Secure"},
  "22":{"detailedText":BP["BED_LOW"],"tagCategory":"Closing","phaseWord":"Secure","criticalCategory":"bed-call-light"},
  "23":{"detailedText":BP["CALL_LIGHT"],"tagCategory":"Closing","phaseWord":"Secure","criticalCategory":"bed-call-light"},
  "24":{"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Secure","criticalCategory":"hand-hygiene"},
}
PATCH["position-on-side"] = {"confusionGroupLabel":None,"studentFocus":"Raise far rail; pillow behind back to prevent rolling; pillow between knees.","steps":pos_steps}

# S09 – bed-wheelchair-transfer (22 steps)
bwt_steps = {}
bwt_data = [
  (1,"Opening","Approach",BP["INTRO_EXPLAIN"],None),
  (2,"Opening","Approach",BP["PRIVACY"],"privacy"),
  (3,"Key Procedure","Approach",BP["HAND_HYGIENE"],"hand-hygiene"),
  (4,"Core","Transfer","Check the brakes on the bed to ensure they are locked.",None),
  (5,"Core","Transfer","Remove the foot pedals from the wheelchair if needed.",None),
  (6,"Core","Transfer","Assist patient to seated on side of bed; allow feet to dangle.",None),
  (7,"Core","Transfer","Assist patient in putting on nonskid footwear.",None),
  (8,"Core","Transfer","Place the gait belt on the patient.",None),
  (9,"Core","Transfer","Position wheelchair so patient moves toward it with stronger side. Chair touches bed.",None),
  (10,"Core","Transfer","Lock the brakes on the wheelchair.",None),
  (11,"Core","Transfer","Ask the patient if they feel dizzy or light-headed.",None),
  (12,"Core","Transfer","Face patient; place feet in front of patient's feet to prevent slipping.",None),
  (13,"Core","Transfer","Instruct patient to push up on bed on count three.",None),
  (14,"Core","Transfer","Grasp gait belt with both hands, palms and fingertips pointing up.",None),
  (15,"Core","Transfer","Count to three; assist patient to stand.",None),
  (16,"Core","Transfer","Assist patient to pivot.",None),
  (17,"Core","Transfer","Instruct patient to grasp wheelchair arms when knees contact seat.",None),
  (18,"Core","Secure","Assist patient to seated in wheelchair.",None),
  (19,"Core","Secure","Remove gait belt gently to avoid skin injury.",None),
  (20,"Core","Secure","Release the wheelchair brakes.",None),
  (21,"Closing","Secure",BP["CALL_LIGHT"],"bed-call-light"),
  (22,"Key Procedure","Secure",BP["HAND_HYGIENE"],"hand-hygiene"),
]
for row in bwt_data:
    sid, tc, pw, dt, cc = row
    entry = {"detailedText":dt,"tagCategory":tc,"phaseWord":pw}
    if cc: entry["criticalCategory"] = cc
    bwt_steps[str(sid)] = entry
PATCH["bed-wheelchair-transfer"] = {"confusionGroupLabel":"MOVE-2 — also see ambulate-transfer-belt.","studentFocus":"Strong side toward wheelchair; lock wheelchair brakes; ask about dizziness.","steps":bwt_steps}

# S10 – ambulate-transfer-belt (18 steps)
atb_steps = {}
atb_data = [
  (1,"Opening","Approach",BP["INTRO_EXPLAIN"],None),
  (2,"Opening","Approach",BP["PRIVACY"],"privacy"),
  (3,"Key Procedure","Approach",BP["HAND_HYGIENE"],"hand-hygiene"),
  (4,"Core","Ambulate","Place nonskid footwear on the patient.",None),
  (5,"Core","Ambulate","Adjust the bed to a safe level.",None),
  (6,"Core","Ambulate","Check the brakes of the bed to ensure they are locked.",None),
  (7,"Core","Ambulate","Allow patient to sit and dangle on edge of bed before standing.",None),
  (8,"Core","Ambulate","Ask patient if they feel dizzy or light-headed.",None),
  (9,"Core","Ambulate","Place gait belt around waist; check tightness by slipping fingers underneath.",None),
  (10,"Core","Ambulate","Face patient; place feet in front of patient's feet.",None),
  (11,"Core","Ambulate","Instruct patient to push up on bed on count three.",None),
  (12,"Core","Ambulate","Count to three; assist patient to standing.",None),
  (13,"Core","Ambulate","Move to weak side; hold belt palms and fingertips up.",None),
  (14,"Core","Ambulate","Assist patient in standing position.",None),
  (15,"Core","Secure","Walk slightly behind patient for 10 feet holding transfer belt.",None),
  (16,"Core","Secure","Safely assist patient back to bed; remove transfer belt.",None),
  (17,"Closing","Secure","Place call light within reach. Lower bed to lowest; brakes locked.","bed-call-light"),
  (18,"Key Procedure","Secure",BP["HAND_HYGIENE"],"hand-hygiene"),
]
for row in atb_data:
    sid, tc, pw, dt, cc = row
    entry = {"detailedText":dt,"tagCategory":tc,"phaseWord":pw}
    if cc: entry["criticalCategory"] = cc
    atb_steps[str(sid)] = entry
PATCH["ambulate-transfer-belt"] = {"confusionGroupLabel":"MOVE-2 — also see bed-wheelchair-transfer.","studentFocus":"Nonskid footwear; gait belt check; walk 10 feet.","steps":atb_steps}

# S11 – prom-shoulder (18 steps)
PATCH["prom-shoulder"] = {
  "confusionGroupLabel":"ROM-2 — also see prom-knee-ankle.",
  "studentFocus":"Support elbow AND wrist throughout; stop at any resistance.",
  "steps":{
    "1":{"detailedText":BP["INTRO_EXPLAIN"],"tagCategory":"Opening","phaseWord":"Approach"},
    "2":{"detailedText":BP["PRIVACY"],"tagCategory":"Opening","phaseWord":"Approach","criticalCategory":"privacy"},
    "3":{"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Approach","criticalCategory":"hand-hygiene"},
    "4":{"detailedText":"Advise patients to report pain during movement.","tagCategory":"Core","phaseWord":"Shoulder"},
    "5":{"detailedText":"Place one hand under the patient's elbow with palm facing up.","tagCategory":"Core","phaseWord":"Shoulder"},
    "6":{"detailedText":"Place the other hand under the patient's wrist with palm facing up.","tagCategory":"Core","phaseWord":"Shoulder"},
    "7":{"detailedText":"Watch patient for objective signs of pain during movement.","tagCategory":"Core","phaseWord":"Shoulder"},
    "8":{"detailedText":"Move arms gently; stop if there is any resistance.","tagCategory":"Core","phaseWord":"Shoulder"},
    "9":{"detailedText":"Keeping arm straight, raise up and over head (flexion).","tagCategory":"Core","phaseWord":"Shoulder"},
    "10":{"detailedText":"Bring arm back down to side (extension).","tagCategory":"Core","phaseWord":"Shoulder"},
    "11":{"detailedText":"Complete flexion/extension per restorative care plan.","tagCategory":"Core","phaseWord":"Shoulder"},
    "12":{"detailedText":"Continue supporting elbow and wrist.","tagCategory":"Core","phaseWord":"Shoulder"},
    "13":{"detailedText":"Move arm out away from body (abduction).","tagCategory":"Core","phaseWord":"Shoulder"},
    "14":{"detailedText":"Move arm gently; stop if resistance.","tagCategory":"Core","phaseWord":"Shoulder"},
    "15":{"detailedText":"Return arm to side (adduction).","tagCategory":"Core","phaseWord":"Secure"},
    "16":{"detailedText":BP["BED_LOW"],"tagCategory":"Closing","phaseWord":"Secure","criticalCategory":"bed-call-light"},
    "17":{"detailedText":BP["CALL_LIGHT"],"tagCategory":"Closing","phaseWord":"Secure","criticalCategory":"bed-call-light"},
    "18":{"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Secure","criticalCategory":"hand-hygiene"},
  }
}

# S12 – prom-knee-ankle (9 steps)
PATCH["prom-knee-ankle"] = {
  "confusionGroupLabel":"ROM-2 — also see prom-shoulder.",
  "studentFocus":"Stop ROM if patient reports pain. Support knee AND ankle.",
  "steps":{
    "1":{"detailedText":BP["INTRO_EXPLAIN"],"tagCategory":"Opening","phaseWord":"Approach"},
    "2":{"detailedText":BP["PRIVACY"],"tagCategory":"Opening","phaseWord":"Approach","criticalCategory":"privacy"},
    "3":{"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Approach","criticalCategory":"hand-hygiene"},
    "4":{"detailedText":"Advise patients to report pain during movement.","tagCategory":"Core","phaseWord":"Lower"},
    "5":{"detailedText":"Abduction/Adduction for Hip: move leg away from and back toward body; stop at resistance; support knee and ankle.","tagCategory":"Core","phaseWord":"Lower"},
    "6":{"detailedText":"Flexion/Extension of Knee and Hip: bend knee and hip toward trunk then straighten; stop at resistance.","tagCategory":"Core","phaseWord":"Lower"},
    "7":{"detailedText":BP["BED_LOW"],"tagCategory":"Closing","phaseWord":"Secure","criticalCategory":"bed-call-light"},
    "8":{"detailedText":BP["CALL_LIGHT"],"tagCategory":"Closing","phaseWord":"Secure","criticalCategory":"bed-call-light"},
    "9":{"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Secure","criticalCategory":"hand-hygiene"},
  }
}

# S13 – knee-high-stocking (11 steps)
PATCH["knee-high-stocking"] = {
  "confusionGroupLabel":"CLOTH-2 — also see dress-weak-right-arm.",
  "studentFocus":"Turn stocking inside out to heel; wrinkle-free to knee.",
  "steps":{
    "1":{"detailedText":BP["INTRO_EXPLAIN"],"tagCategory":"Opening","phaseWord":"Approach"},
    "2":{"detailedText":BP["PRIVACY"],"tagCategory":"Opening","phaseWord":"Approach","criticalCategory":"privacy"},
    "3":{"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Approach","criticalCategory":"hand-hygiene"},
    "4":{"detailedText":"Position patient supine. Expose only the leg being fitted.","tagCategory":"Core","phaseWord":"Apply"},
    "5":{"detailedText":"Turn the stocking inside out to the heel.","tagCategory":"Core","phaseWord":"Apply"},
    "6":{"detailedText":"Place stocking over patient's toes, foot, and heel.","tagCategory":"Core","phaseWord":"Apply"},
    "7":{"detailedText":"Gently pull the stocking up their leg.","tagCategory":"Core","phaseWord":"Apply"},
    "8":{"detailedText":"Move foot and leg gently; avoid force and over-extension.","tagCategory":"Core","phaseWord":"Apply"},
    "9":{"detailedText":"Adjust stocking wrinkle-free to the knee.","tagCategory":"Core","phaseWord":"Secure"},
    "10":{"detailedText":"Place call light within reach. Lower bed; brakes locked.","tagCategory":"Closing","phaseWord":"Secure","criticalCategory":"bed-call-light"},
    "11":{"detailedText":BP["HAND_HYGIENE"],"tagCategory":"Key Procedure","phaseWord":"Secure","criticalCategory":"hand-hygiene"},
  }
}

# Stubs for S14–S22
STUBS = {
  "bed-bath-face-arm":     ("S14",28,None,"Water temp check; gloves; eyes inner-to-outer; no soap on face."),
  "denture-care":          ("S15",19,None,"Line sink; handle over washcloth; rinse with cool water."),
  "partial-bed-bath":      ("S16",24,"BATH-2 — also see bed-bath-face-arm.","Change water for different body regions."),
  "foot-care":             ("S17",24,None,"Soak 5–10 min; dry between toes; lotion NOT between toes."),
  "dress-weak-right-arm":  ("S18",14,"CLOTH-2 — also see knee-high-stocking.","Dress affected arm FIRST; undress unaffected arm FIRST."),
  "hand-and-nail-care":    ("S19",22,None,"Soak hands; push back cuticles; dry between fingers."),
  "oral-care-unconscious": ("S20",26,"ORAL-2 — also see denture-care.","Turn head to side; padded tongue depressor; keep airway clear."),
  "perineal-care-female":  ("S21",41,None,"41 steps; front-to-back; separate washcloth each stroke."),
  "catheter-care-female":  ("S22",31,None,"Clean 4 inches down catheter; never pull tubing."),
}
for sid, (section, count, cgl, sf) in STUBS.items():
    PATCH[sid] = {
        "confusionGroupLabel": cgl,
        "studentFocus": sf,
        "_importNote": f"Step data in FINAL-PASS {section} ({count} steps) — paste TSV to generate step-level JSON",
        "steps": {}
    }

(out / "skills-7-enrichment-patch.json").write_text(json.dumps(PATCH, indent=2, ensure_ascii=False))

# D: README
readme = """\
# LMCC CNA Exam Prep — Code-Addition Package
Generated: 2026-06-22
Sources: FINAL-PASS-S05-S22-COMPLETE.md · Skills-Multiple-occurance-list-TAGs.xlsx

## Files

| File | Purpose |
|---|---|
| checklist-step-2.ts | Drop-in replacement — adds 5 new fields to ChecklistStep |
| skillCurriculum-6-patch.ts | Wires getPhaseWordForStep() to per-step phase badges |
| skills-7-enrichment-patch.json | Data patch for skills-7.json (13 full + 9 stubs) |

## A — checklist-step-2.ts

Five new fields added to ChecklistStep (all optional, backwards-compatible):

  detailedText    — "Detailed Tag Text" — full GWC rubric language
  tagCategory     — "Tag Category"      — Opening | Key Procedure | Core | Closing
  criticalCategory— "Critical Category" — hand-hygiene | privacy | bed-call-light
  examScorecard   — "Exam Scorecard"    — yellow badge text on scored steps
  phaseWord       — "Phase Word"        — override for computed phase label

## B — skillCurriculum-6-patch.ts

getPhaseWordForStep() was already written in skillCurriculum-6.ts but never
called during render. This patch exports two new helpers:

  getStepPhaseLabel(step, skillId) -> string   // "Measure", "Secure", …
  getStepPhaseColor(step, skillId) -> string   // hex colour

Phase badge colour scheme:
  Blue  #3B82F6 = OPEN segment (Approach, Prepare, Identify)
  Amber #F59E0B = CORE segment (all task-specific phase words)
  Green #10B981 = CLOSE segment (Record)

Resolution order: step.phaseWord > getPhaseWordForStep() > segment fallback

## C — skills-7-enrichment-patch.json

### Merge script (Node.js)

  const base  = require('./skills-7.json');
  const patch = require('./skills-7-enrichment-patch.json');
  for (const [id, p] of Object.entries(patch)) {
    const skill = base.skills.find(s => s.id === id);
    if (!skill) continue;
    if (p.confusionGroupLabel !== undefined) skill.confusionGroupLabel = p.confusionGroupLabel;
    if (p.studentFocus !== undefined) skill.studentFocus = p.studentFocus;
    for (const [stepId, stepPatch] of Object.entries(p.steps ?? {})) {
      const step = skill.checklistSteps?.find(s => s.id === +stepId);
      if (step) Object.assign(step, stepPatch);
    }
  }
  require('fs').writeFileSync('./skills-7-updated.json', JSON.stringify(base, null, 2));

### 9 skills with empty steps{} (S14–S22)

  bed-bath-face-arm     S14  28 steps
  denture-care          S15  19 steps
  partial-bed-bath      S16  24 steps
  foot-care             S17  24 steps
  dress-weak-right-arm  S18  14 steps
  hand-and-nail-care    S19  22 steps
  oral-care-unconscious S20  26 steps
  perineal-care-female  S21  41 steps
  catheter-care-female  S22  31 steps

To complete these: paste the PASTE-READY TSV blocks from FINAL-PASS-S05-S22-COMPLETE.md
into the next message and step-level JSON will be generated.

## GitHub paths to confirm

  src/types/checklist-step-2.ts         ← drop-in replace
  src/lib/skillCurriculum-6.ts          ← import patch helpers here
  src/data/skills-7.json                ← merge target
  src/data/master_course_database.json  ← source of confusionGroupLabel/studentFocus

## confusionGroupLabel + studentFocus

Both ported from master_course_database.json (confusion_group / student_focus).
Zero render weight — strings, only shown when banner condition is met.
"""
(out / "IMPLEMENTATION-GUIDE.md").write_text(readme)

# Zip
zip_path = Path("/root/output/lmcc-code-additions.zip")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(out.iterdir()):
        zf.write(f, f.name)

for f in sorted(out.iterdir()):
    print(f"{f.name:50s}  {f.stat().st_size:>8,} bytes")
print(f"\nzip: {zip_path.stat().st_size // 1024} KB")