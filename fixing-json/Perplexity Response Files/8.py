
# Re-write all 4 files in one cell (session state was lost)
from pathlib import Path
import json

out = Path.home() / "output" / "lmcc-code-additions"
out.mkdir(parents=True, exist_ok=True)

# ── A: checklist-step-2.ts ────────────────────────────────────────────────────
ts_a = '''\
// checklist-step-2.ts
// Extended ChecklistStep type — adds FINAL-PASS columns to every step object.
// Source: FINAL-PASS-S05-S22-COMPLETE.md  +  Skills-Multiple-occurance-list-TAGs.xlsx
// Drop-in replacement.  No existing field removed or renamed.

export type StepSegment = "open" | "core" | "close";

export type BoilerplateId =
  | "INTRO_IDENTIFY"
  | "INTRO_EXPLAIN"
  | "PRIVACY"
  | "HAND_HYGIENE"
  | "GLOVE_DON"
  | "GLOVE_REMOVE"
  | "GLOVE_REMOVE_THEN_HH"
  | "CALL_LIGHT"
  | "BED_LOW"
  | "WATER_CHECK";

/** Pipe-delimited compound boilerplate — used when GWC combines two scored items
 *  in one step (S10 step 17, S13 step 10). */
export type CompoundBoilerplateId = "BED_LOW|CALL_LIGHT";

export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
  segment?: StepSegment;
  boilerplateId?: BoilerplateId | CompoundBoilerplateId | (string & {});

  // ─── New — ported from FINAL-PASS 11-column tables ────────────────────────

  /** Full GWC rubric language ("Detailed Tag Text" column).
   *  Displayed in the expand panel and fed to AI study mode. */
  detailedText?: string;

  /** Broad classification bucket ("Tag Category" column).
   *  Values: "Opening" | "Key Procedure" | "Core" | "Closing" */
  tagCategory?: string;

  /** Machine-readable critical-point label ("Critical Category" column).
   *  Values in curriculum: "hand-hygiene" | "privacy" | "bed-call-light"
   *  null / undefined → no confusion-pair badge rendered. */
  criticalCategory?: string;

  /** Exam-scorecard annotation ("Exam Scorecard" column).
   *  Shown as a yellow badge when non-null.
   *  Examples:
   *    "Exam tolerance: Document BP \\u00b18 mmHg (systolic AND diastolic)"
   *    "Technique: Deflate rate 2\\u20133 mm Hg/second (systolic)"
   *    "Exam tolerance: Record volume \\u00b125 mL" */
  examScorecard?: string;

  /** Override the segment-level phase label from getPhaseWordForStep()
   *  ("Phase Word" column).
   *  Populate only when a step\\u2019s Phase Word differs from the segment default.
   *  Example: S08 steps 19\\u201321 are in CORE but carry phaseWord "Secure". */
  phaseWord?: string;
};
'''
(out / "checklist-step-2.ts").write_text(ts_a)

# ── B: skillCurriculum-6-patch.ts ─────────────────────────────────────────────
ts_b = '''\
// skillCurriculum-6-patch.ts
// Wires the already-existing getPhaseWordForStep() to per-step phase badges.
// Add to the same barrel/index that exports skillCurriculum-6.ts, or import
// directly into the step-row component.

import { getPhaseWordForStep } from "./skillCurriculum-6";
import type { ChecklistStep, StepSegment } from "./checklist-step-2";

// ── Phase badge colour map ─────────────────────────────────────────────────
export const PHASE_COLORS: Record<string, string> = {
  // OPEN phase words — blue
  Approach:  "#3B82F6",
  Prepare:   "#3B82F6",
  Identify:  "#3B82F6",
  Introduce: "#3B82F6",

  // CORE task-specific phase words — amber
  Wash:      "#F59E0B",
  Measure:   "#F59E0B",
  Weigh:     "#F59E0B",
  Transfer:  "#F59E0B",
  Position:  "#F59E0B",
  Ambulate:  "#F59E0B",
  Shoulder:  "#F59E0B",
  Lower:     "#F59E0B",
  Apply:     "#F59E0B",
  Bathe:     "#F59E0B",
  Don:       "#F59E0B",
  Doff:      "#F59E0B",
  Foot:      "#F59E0B",
  Hand:      "#F59E0B",
  Dress:     "#F59E0B",
  Oral:      "#F59E0B",
  Peri:      "#F59E0B",
  Catheter:  "#F59E0B",
  Count:     "#F59E0B",

  // Late-CORE / comfort — darker amber
  Secure:    "#D97706",
  Finish:    "#D97706",
  Clean:     "#D97706",

  // CLOSE phase words — green
  Record:    "#10B981",
  Work:      "#10B981",
};

const SEGMENT_FALLBACK: Record<StepSegment, string> = {
  open:  "#3B82F6",
  core:  "#F59E0B",
  close: "#10B981",
};

/** Returns the phase badge colour for a step.
 *  Resolution: step.phaseWord > getPhaseWordForStep() > segment fallback */
export function getStepPhaseColor(step: ChecklistStep, skillId: string): string {
  const word = step.phaseWord ?? getPhaseWordForStep(skillId, step.id) ?? step.segment;
  return (word && PHASE_COLORS[word]) ?? SEGMENT_FALLBACK[step.segment ?? "core"];
}

/** Returns the display label for a step\'s phase badge. */
export function getStepPhaseLabel(step: ChecklistStep, skillId: string): string {
  return (
    step.phaseWord ??
    getPhaseWordForStep(skillId, step.id) ??
    (step.segment ? capitalize(step.segment) : "")
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/*
USAGE — inside step-row JSX:

  import { getStepPhaseLabel, getStepPhaseColor } from "./skillCurriculum-6-patch";

  function StepRow({ step, skillId }) {
    const label = getStepPhaseLabel(step, skillId);
    const color = getStepPhaseColor(step, skillId);
    return (
      <div>
        <span className="phase-badge rounded px-2 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: color }}>
          {label}
        </span>
        // ... rest of step row ...
      </div>
    );
  }
*/
'''
(out / "skillCurriculum-6-patch.ts").write_text(ts_b)

# ── C: skills-7-enrichment-patch.json (13 fully-populated + 9 stubs) ─────────
BP = {
  "INTRO_EXPLAIN":   "Introduce yourself by name and title, explain the procedure to the patient in clear, plain language, and obtain verbal consent before proceeding.",
  "HAND_HYGIENE":    "Perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water, or use an alcohol-based hand rub when hands are visibly clean.",
  "PRIVACY":         "Provide for patient privacy — close the curtain, door, or privacy screen.",
  "GLOVE_DON":       "Don clean, non-sterile gloves.",
  "GLOVE_REMOVE":    "Remove gloves by turning them inside out — grasp the outside of one glove at the wrist and peel it off, then slide the fingers of the ungloved hand under the remaining glove at the wrist and peel it off turning inside out. Dispose of both gloves in the appropriate waste container without touching the outer surface.",
  "CALL_LIGHT":      "Place the call light or signaling device within reach of the patient and confirm the patient knows how to use it.",
  "BED_LOW":         "Lower the bed to its lowest position and verify the bed brakes are locked.",
}

PATCH = {
  "manual-blood-pressure": {
    "confusionGroupLabel": None,
    "studentFocus": "Cuff on bare skin; cleanse equipment before and after; document both values within ±8 mmHg.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening", "phaseWord":"Prepare"},
      "2":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Prepare", "criticalCategory":"hand-hygiene"},
      "3":  {"detailedText":"Cleanse the stethoscope and blood pressure cuff prior to placing it on the patient's skin.", "tagCategory":"Core", "phaseWord":"Prepare"},
      "4":  {"detailedText":"Place the patient in a relaxed reclining or sitting position. Ask the patient which arm they prefer. Both feet should be on the floor and the arm should be supported at heart level.", "tagCategory":"Core", "phaseWord":"Prepare"},
      "5":  {"detailedText":"Remove or rearrange clothing so the cuff and the stethoscope are on bare skin.", "tagCategory":"Core", "phaseWord":"Measure"},
      "6":  {"detailedText":"Center the bladder of the blood pressure cuff over the brachial artery with the lower margin 1\" above the antecubital space. Fit the cuff evenly and snugly.", "tagCategory":"Core", "phaseWord":"Measure"},
      "7":  {"detailedText":"Inflate the cuff to 160–180 mmHg.", "tagCategory":"Core", "phaseWord":"Measure", "examScorecard":"Technique: Inflate cuff 160–180 mmHg"},
      "8":  {"detailedText":"Deflate the cuff gradually at a constant rate (2–3 mmHg/second) until the first Korotkoff sound is heard. Note the systolic pressure.", "tagCategory":"Core", "phaseWord":"Measure", "examScorecard":"Technique: Deflate rate 2–3 mmHg/second (systolic)"},
      "9":  {"detailedText":"Continue to deflate the cuff slowly at 2 mmHg/second. Note the point at which Korotkoff sounds disappear completely as the diastolic pressure.", "tagCategory":"Core", "phaseWord":"Measure", "examScorecard":"Technique: Deflate rate 2 mmHg/second (diastolic)"},
      "10": {"detailedText":"Deflate the cuff completely and remove the cuff from the patient's arm.", "tagCategory":"Core", "phaseWord":"Measure"},
      "11": {"detailedText":"Inform the patient of the blood pressure reading.", "tagCategory":"Core", "phaseWord":"Measure"},
      "12": {"detailedText":"Cleanse the stethoscope and blood pressure cuff.", "tagCategory":"Core", "phaseWord":"Record"},
      "13": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Record", "criticalCategory":"hand-hygiene"},
      "14": {"detailedText":"Document both systolic and diastolic pressures each within plus or minus 8 mmHg of the evaluator's reading.", "tagCategory":"Closing", "phaseWord":"Record", "examScorecard":"Exam tolerance: Document BP ±8 mmHg (systolic AND diastolic)"},
    }
  },
  "weight-ambulatory-client": {
    "confusionGroupLabel": None,
    "studentFocus": "Balance scale to zero; nonskid footwear; document within ±2 lbs.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening", "phaseWord":"Prepare"},
      "2":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Prepare", "criticalCategory":"hand-hygiene"},
      "3":  {"detailedText":"Verify the patient is wearing nonskid footwear.", "tagCategory":"Core", "phaseWord":"Prepare"},
      "4":  {"detailedText":"Balance (or zero) scale.", "tagCategory":"Core", "phaseWord":"Prepare"},
      "5":  {"detailedText":"Walk the patient to the scale.", "tagCategory":"Core", "phaseWord":"Weigh"},
      "6":  {"detailedText":"Assist the patient to step on the scale.", "tagCategory":"Core", "phaseWord":"Weigh"},
      "7":  {"detailedText":"Check that the patient is centered on the scale.", "tagCategory":"Core", "phaseWord":"Weigh"},
      "8":  {"detailedText":"Check that the patient has their arms at their side.", "tagCategory":"Core", "phaseWord":"Weigh"},
      "9":  {"detailedText":"Ensure the patient is not holding on to anything that would alter the reading.", "tagCategory":"Core", "phaseWord":"Weigh"},
      "10": {"detailedText":"Adjust the weights until the scale is in balance or read analog scale.", "tagCategory":"Core", "phaseWord":"Weigh"},
      "11": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Closing", "phaseWord":"Record"},
      "12": {"detailedText":"Document weight (plus/minus 2 lbs. or 0.9 kg).", "tagCategory":"Closing", "phaseWord":"Record", "examScorecard":"Exam tolerance: Document weight ±2 lb / 0.9 kg"},
      "13": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Record", "criticalCategory":"hand-hygiene"},
    }
  },
  "urinary-output-measurement": {
    "confusionGroupLabel": None,
    "studentFocus": "Gloves on before pouring; measure at eye level; record within ±25 mL.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening", "phaseWord":"Prepare"},
      "2":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Prepare", "criticalCategory":"hand-hygiene"},
      "3":  {"detailedText": BP["GLOVE_DON"],     "tagCategory":"Key Procedure", "phaseWord":"Prepare"},
      "4":  {"detailedText":"Pour the liquid in the bedpan into a measuring container.", "tagCategory":"Core", "phaseWord":"Measure"},
      "5":  {"detailedText":"Rinse the bedpan and empty the water into the toilet.", "tagCategory":"Core", "phaseWord":"Measure"},
      "6":  {"detailedText":"Measure the amount of urine at eye level with the container on a flat surface.", "tagCategory":"Core", "phaseWord":"Measure"},
      "7":  {"detailedText":"Empty the urine into the toilet.", "tagCategory":"Core", "phaseWord":"Measure"},
      "8":  {"detailedText":"Rinse the measuring container with water and empty it into the toilet.", "tagCategory":"Core", "phaseWord":"Measure"},
      "9":  {"detailedText": BP["GLOVE_REMOVE"],  "tagCategory":"Key Procedure", "phaseWord":"Record"},
      "10": {"detailedText":"Record the volume within plus or minus 25 mL of the actual volume.", "tagCategory":"Closing", "phaseWord":"Record", "examScorecard":"Exam tolerance: Record volume ±25 mL"},
      "11": {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Record", "criticalCategory":"hand-hygiene"},
    }
  },
  "position-on-side": {
    "confusionGroupLabel": None,
    "studentFocus": "Raise far rail first; pillow behind back to prevent rolling; pillow between knees.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening",       "phaseWord":"Approach"},
      "2":  {"detailedText": BP["PRIVACY"],       "tagCategory":"Opening",       "phaseWord":"Approach", "criticalCategory":"privacy"},
      "3":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Approach", "criticalCategory":"hand-hygiene"},
      "4":  {"detailedText":"Position the bed flat.", "tagCategory":"Core", "phaseWord":"Position"},
      "5":  {"detailedText":"Raise the bed height.", "tagCategory":"Core", "phaseWord":"Position"},
      "6":  {"detailedText":"Raise the side rail on the side the patient will face after repositioning.", "tagCategory":"Core", "phaseWord":"Position"},
      "7":  {"detailedText":"Move to the working side of the bed (opposite the raised rail).", "tagCategory":"Core", "phaseWord":"Position"},
      "8":  {"detailedText":"Explain to the patient you will move them closer before turning on the count of three.", "tagCategory":"Core", "phaseWord":"Position"},
      "9":  {"detailedText":"Count to three and move the patient towards you.", "tagCategory":"Core", "phaseWord":"Position"},
      "10": {"detailedText":"Instruct the patient to move their arm closest to the raised rail away from their body.", "tagCategory":"Core", "phaseWord":"Position"},
      "11": {"detailedText":"Raise the patient's knee closest to you to assist in turning.", "tagCategory":"Core", "phaseWord":"Position"},
      "12": {"detailedText":"Explain you will turn the patient toward the side rail on count three.", "tagCategory":"Core", "phaseWord":"Position"},
      "13": {"detailedText":"Count to three to turn the patient toward the raised side rail.", "tagCategory":"Core", "phaseWord":"Position"},
      "14": {"detailedText":"Ensure the patient's face never comes close to the side rail or becomes covered by the pillow.", "tagCategory":"Core", "phaseWord":"Position"},
      "15": {"detailedText":"Check that the patient is not lying on their bottom arm.", "tagCategory":"Core", "phaseWord":"Position"},
      "16": {"detailedText":"Place a pillow behind the patient's back, ensuring they will not roll back supine.", "tagCategory":"Core", "phaseWord":"Position"},
      "17": {"detailedText":"Move to the end of the bed and check that the patient is in correct body alignment.", "tagCategory":"Core", "phaseWord":"Position"},
      "18": {"detailedText":"Verify the patient is in the middle of the bed.", "tagCategory":"Core", "phaseWord":"Position"},
      "19": {"detailedText":"Place a pillow between the top arm and rib cage so the elbow is not directly on the ribs.", "tagCategory":"Core", "phaseWord":"Secure"},
      "20": {"detailedText":"Place a pillow under the top knee so it is not resting on the other knee or ankle.", "tagCategory":"Core", "phaseWord":"Secure"},
      "21": {"detailedText":"Adjust the pillow under the patient's head for comfort.", "tagCategory":"Core", "phaseWord":"Secure"},
      "22": {"detailedText": BP["BED_LOW"],      "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "23": {"detailedText": BP["CALL_LIGHT"],   "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "24": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Secure", "criticalCategory":"hand-hygiene"},
    }
  },
  "bed-wheelchair-transfer": {
    "confusionGroupLabel": "MOVE-2 — also see ambulate-transfer-belt. Same belt grip; different destination.",
    "studentFocus": "Strong side toward wheelchair; lock wheelchair brakes; ask about dizziness before standing.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening",       "phaseWord":"Approach"},
      "2":  {"detailedText": BP["PRIVACY"],       "tagCategory":"Opening",       "phaseWord":"Approach", "criticalCategory":"privacy"},
      "3":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Approach", "criticalCategory":"hand-hygiene"},
      "4":  {"detailedText":"Check the brakes on the bed to ensure they are locked.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "5":  {"detailedText":"Remove the foot pedals from the wheelchair if needed.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "6":  {"detailedText":"Assist the patient to a seated position on the side of the bed; allow feet to dangle.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "7":  {"detailedText":"Assist the patient in putting on nonskid footwear.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "8":  {"detailedText":"Place the gait belt on the patient.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "9":  {"detailedText":"Position the wheelchair so the patient moves toward it with the stronger side. Chair should touch the bed.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "10": {"detailedText":"Lock the brakes on the wheelchair.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "11": {"detailedText":"Ask the patient if they feel dizzy or light-headed.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "12": {"detailedText":"Face the patient and place each of your feet in front of the patient's feet.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "13": {"detailedText":"Instruct the patient to push up on the bed on the count of three.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "14": {"detailedText":"Grasp the gait belt with both hands, palms and fingertips pointing up.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "15": {"detailedText":"Count to three and assist the patient to stand.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "16": {"detailedText":"Assist the patient to pivot.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "17": {"detailedText":"Instruct the patient to grasp the arms of the wheelchair when they feel the back of their knees contact the seat.", "tagCategory":"Core", "phaseWord":"Transfer"},
      "18": {"detailedText":"Assist the patient to a seated position in the wheelchair.", "tagCategory":"Core", "phaseWord":"Secure"},
      "19": {"detailedText":"Remove the gait belt gently to avoid skin injury.", "tagCategory":"Core", "phaseWord":"Secure"},
      "20": {"detailedText":"Release the wheelchair brakes.", "tagCategory":"Core", "phaseWord":"Secure"},
      "21": {"detailedText": BP["CALL_LIGHT"],   "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "22": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Secure", "criticalCategory":"hand-hygiene"},
    }
  },
  "ambulate-transfer-belt": {
    "confusionGroupLabel": "MOVE-2 — also see bed-wheelchair-transfer. Same belt grip; patient walks 10 ft.",
    "studentFocus": "Nonskid footwear; gait belt on before standing; walk 10 feet.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening",       "phaseWord":"Approach"},
      "2":  {"detailedText": BP["PRIVACY"],       "tagCategory":"Opening",       "phaseWord":"Approach", "criticalCategory":"privacy"},
      "3":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Approach", "criticalCategory":"hand-hygiene"},
      "4":  {"detailedText":"Place nonskid footwear on the patient.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "5":  {"detailedText":"Adjust the bed to a safe level.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "6":  {"detailedText":"Check the brakes of the bed to ensure they are locked.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "7":  {"detailedText":"Allow the patient to sit and dangle on the edge of the bed before standing.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "8":  {"detailedText":"Ask the patient if they feel dizzy or light-headed.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "9":  {"detailedText":"Place the gait belt around the patient's waist and check tightness by slipping fingers underneath.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "10": {"detailedText":"Face the patient and place each of your feet in front of the patient's feet.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "11": {"detailedText":"Instruct the patient to push up on the bed on the count of three.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "12": {"detailedText":"Count to three and assist the patient to a standing position.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "13": {"detailedText":"Move to the weak side of the patient, slightly behind. Hold belt palms and fingertips up.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "14": {"detailedText":"Assist the patient in a standing position.", "tagCategory":"Core", "phaseWord":"Ambulate"},
      "15": {"detailedText":"Walk slightly behind the patient for a distance of 10 feet while holding the transfer belt.", "tagCategory":"Core", "phaseWord":"Secure"},
      "16": {"detailedText":"Safely assist the patient back to bed and remove the transfer belt.", "tagCategory":"Core", "phaseWord":"Secure"},
      "17": {"detailedText":"Place the call light within reach of the patient. Lower the bed to its lowest position and verify brakes are locked.", "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "18": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Secure", "criticalCategory":"hand-hygiene"},
    }
  },
  "prom-shoulder": {
    "confusionGroupLabel": "ROM-2 — also see prom-knee-ankle. Same pain-stop rule; upper extremity.",
    "studentFocus": "Support elbow AND wrist throughout; stop immediately at resistance.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening",       "phaseWord":"Approach"},
      "2":  {"detailedText": BP["PRIVACY"],       "tagCategory":"Opening",       "phaseWord":"Approach", "criticalCategory":"privacy"},
      "3":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Approach", "criticalCategory":"hand-hygiene"},
      "4":  {"detailedText":"Advise patients to report pain during movement.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "5":  {"detailedText":"Place one hand under the patient's elbow with palm facing up.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "6":  {"detailedText":"Place the other hand under the patient's wrist with palm facing up.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "7":  {"detailedText":"Watch the patient for objective signs of pain during movement.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "8":  {"detailedText":"Move their arms gently and stop if there is any resistance.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "9":  {"detailedText":"While keeping the patient's arm straight, raise their arm up and over their head (flexion).", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "10": {"detailedText":"Bring the patient's arm back down to their side (extension).", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "11": {"detailedText":"Complete flexion and extension movements according to the restorative care plan.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "12": {"detailedText":"Continue to support the elbow and wrist of the patient.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "13": {"detailedText":"Keeping the arm straight, move it out away from the body (abduction).", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "14": {"detailedText":"Move their arms gently and stop if there is any resistance.", "tagCategory":"Core", "phaseWord":"Shoulder"},
      "15": {"detailedText":"Return the patient's arm to their side (adduction).", "tagCategory":"Core", "phaseWord":"Secure"},
      "16": {"detailedText": BP["BED_LOW"],      "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "17": {"detailedText": BP["CALL_LIGHT"],   "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "18": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Secure", "criticalCategory":"hand-hygiene"},
    }
  },
  "prom-knee-ankle": {
    "confusionGroupLabel": "ROM-2 — also see prom-shoulder. Same pain-stop rule; lower extremity two joints.",
    "studentFocus": "Stop ROM if patient reports pain. Support knee AND ankle.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening",       "phaseWord":"Approach"},
      "2":  {"detailedText": BP["PRIVACY"],       "tagCategory":"Opening",       "phaseWord":"Approach", "criticalCategory":"privacy"},
      "3":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Approach", "criticalCategory":"hand-hygiene"},
      "4":  {"detailedText":"Advise patients to report pain during movement.", "tagCategory":"Core", "phaseWord":"Lower"},
      "5":  {"detailedText":"Abduction/Adduction for Hip: gently move leg away from body then back, stopping at any resistance.", "tagCategory":"Core", "phaseWord":"Lower"},
      "6":  {"detailedText":"Flexion/Extension of Knee and Hip: bend knee and hip toward trunk then straighten, stopping at any resistance.", "tagCategory":"Core", "phaseWord":"Lower"},
      "7":  {"detailedText": BP["BED_LOW"],      "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "8":  {"detailedText": BP["CALL_LIGHT"],   "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "9":  {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Secure", "criticalCategory":"hand-hygiene"},
    }
  },
  "knee-high-stocking": {
    "confusionGroupLabel": "CLOTH-2 — also see dress-weak-right-arm. Both involve careful limb handling.",
    "studentFocus": "Turn stocking inside out to heel; wrinkle-free to knee.",
    "steps": {
      "1":  {"detailedText": BP["INTRO_EXPLAIN"], "tagCategory":"Opening",       "phaseWord":"Approach"},
      "2":  {"detailedText": BP["PRIVACY"],       "tagCategory":"Opening",       "phaseWord":"Approach", "criticalCategory":"privacy"},
      "3":  {"detailedText": BP["HAND_HYGIENE"],  "tagCategory":"Key Procedure", "phaseWord":"Approach", "criticalCategory":"hand-hygiene"},
      "4":  {"detailedText":"Position the patient supine. Expose only the leg being fitted.", "tagCategory":"Core", "phaseWord":"Apply"},
      "5":  {"detailedText":"Gather supplies and turn the stocking inside out to the heel.", "tagCategory":"Core", "phaseWord":"Apply"},
      "6":  {"detailedText":"Place the stocking over the patient's toes, foot, and heel.", "tagCategory":"Core", "phaseWord":"Apply"},
      "7":  {"detailedText":"Gently pull the stocking up their leg.", "tagCategory":"Core", "phaseWord":"Apply"},
      "8":  {"detailedText":"Move foot and leg gently and naturally, avoiding force and over-extension.", "tagCategory":"Core", "phaseWord":"Apply"},
      "9":  {"detailedText":"Adjust stocking; it should be wrinkle-free to the knee.", "tagCategory":"Core", "phaseWord":"Secure"},
      "10": {"detailedText":"Place the call light within reach. Lower the bed and verify brakes locked.", "tagCategory":"Closing", "phaseWord":"Secure", "criticalCategory":"bed-call-light"},
      "11": {"detailedText": BP["HAND_HYGIENE"], "tagCategory":"Key Procedure", "phaseWord":"Secure", "criticalCategory":"hand-hygiene"},
    }
  },
}

# Stubs for S14–S22 (need FINAL-PASS TSV to fill steps)
STUBS = {
  "bed-bath-face-arm":     ("S14",28,"BATH-2 — also see partial-bed-bath. Face + one arm only.",  "Water temp check; gloves; eyes inner-to-outer; no soap on face."),
  "denture-care":          ("S15",19,None,                                                          "Line sink; handle over washcloth; rinse with cool water."),
  "partial-bed-bath":      ("S16",24,"BATH-2 — also see bed-bath-face-arm. 24 steps; gown change.","Water temp check; change water for different body regions."),
  "foot-care":             ("S17",24,None,                                                          "Soak 5–10 min; dry between toes; lotion NOT between toes."),
  "dress-weak-right-arm":  ("S18",14,"CLOTH-2 — also see knee-high-stocking.",                     "Dress affected arm FIRST; undress unaffected arm FIRST."),
  "hand-and-nail-care":    ("S19",22,None,                                                          "Soak hands; push back cuticles; dry between fingers."),
  "oral-care-unconscious": ("S20",26,"ORAL-2 — also see denture-care. HOB 30–45°; turn head.",     "Turn head to side; padded tongue depressor; no swallowing."),
  "perineal-care-female":  ("S21",41,None,                                                          "41 steps; front-to-back; separate washcloth each stroke."),
  "catheter-care-female":  ("S22",31,None,                                                          "Clean 4 inches down catheter; never pull tubing."),
}
for sid, (section, count, cgl, sf) in STUBS.items():
    PATCH[sid] = {
        "confusionGroupLabel": cgl,
        "studentFocus": sf,
        "_importNote": f"Step data present in FINAL-PASS {section} ({count} steps) — paste TSV to generate step-level JSON",
        "steps": {}
    }

(out / "skills-7-enrichment-patch.json").write_text(json.dumps(PATCH, indent=2, ensure_ascii=False))

for f in sorted(out.iterdir()):
    print(f"{f.name:45s}  {f.stat().st_size:>8,} bytes")