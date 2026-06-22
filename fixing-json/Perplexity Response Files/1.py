
import json

# ── boilerplate lookup ──────────────────────────────────────────────────────
BP = {
  "INTRO_IDENTIFY":  "Introduce yourself by name and title, and verify the patient's identity using two identifiers (name and date of birth or wristband ID).",
  "INTRO_EXPLAIN":   "Introduce yourself by name and title, explain the procedure to the patient in clear, plain language, and obtain verbal consent before proceeding.",
  "PRIVACY":         "Provide for patient privacy — close the curtain, door, or privacy screen.",
  "HAND_HYGIENE":    "Perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water, or use an alcohol-based hand rub when hands are visibly clean.",
  "GLOVE_DON":       "Don clean, non-sterile gloves.",
  "GLOVE_REMOVE":    "Remove gloves by turning them inside out — grasp the outside of one glove at the wrist and peel it off, then slide the fingers of the ungloved hand under the remaining glove at the wrist and peel it off turning inside out. Dispose of both gloves in the appropriate waste container without touching the outer surface.",
  "GLOVE_REMOVE_THEN_HH": "Remove gloves by turning them inside out and dispose without touching the outer surface, then immediately perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water, or alcohol-based hand rub if hands are visibly clean.",
  "CALL_LIGHT":      "Place the call light or signaling device within reach of the patient and confirm the patient knows how to use it.",
  "BED_LOW":         "Lower the bed to its lowest position and verify the bed brakes are locked.",
  "WATER_CHECK":     "Fill the basin with warm water. Verify the temperature is safe and comfortable — approximately 105–110°F (40–43°C) — using a thermometer, or by having the patient test with their hand or a wet washcloth on the back of their hand.",
}

# Per-tag metadata from Skills-Multiple-occurance-list-TAGs-and-other.xlsx
TAG_META = {
  "INTRO_IDENTIFY":  {"tagCategory":"Opening","criticalCategory":None,"examScorecard":None},
  "INTRO_EXPLAIN":   {"tagCategory":"Opening","criticalCategory":None,"examScorecard":None},
  "PRIVACY":         {"tagCategory":"Opening","criticalCategory":"privacy","examScorecard":None},
  "HAND_HYGIENE":    {"tagCategory":"Key Procedure","criticalCategory":"hand-hygiene","examScorecard":None},
  "GLOVE_DON":       {"tagCategory":"Key Procedure","criticalCategory":None,"examScorecard":None},
  "GLOVE_REMOVE":    {"tagCategory":"Key Procedure","criticalCategory":None,"examScorecard":None},
  "GLOVE_REMOVE_THEN_HH":{"tagCategory":"Key Procedure","criticalCategory":"hand-hygiene","examScorecard":None},
  "CALL_LIGHT":      {"tagCategory":"Closing","criticalCategory":"bed-call-light","examScorecard":None},
  "BED_LOW":         {"tagCategory":"Closing","criticalCategory":"bed-call-light","examScorecard":None},
  "WATER_CHECK":     {"tagCategory":"Opening","criticalCategory":None,"examScorecard":None},
}

# ── per-skill FINAL-PASS data ───────────────────────────────────────────────
# Each entry: list of dicts with keys matching ChecklistStep
# tagCategory / criticalCategory / examScorecard / phaseWord / detailedText
# sourced verbatim from FINAL-PASS-S05-S22-COMPLETE.md and skills-7.json

SKILLS_ENRICHED = {

"hand-hygiene": {
  "confusionGroupLabel": None,
  "studentFocus": "First skill on many CA exam lists; required before all patient contact.",
  "steps": [
    {"id":1,"text":"Introduce and identify the patient","segment":"open","boilerplateId":"INTRO_IDENTIFY",
     "detailedText":BP["INTRO_IDENTIFY"],"tagCategory":"Opening","phaseWord":"Identify","criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Turn on warm water","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Turn on the water and adjust the flow so that the water is warm.","criticalCategory":None,"examScorecard":None},
    {"id":3,"text":"Wet hands below elbows","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Wet hands thoroughly, keeping hands and forearms lower than elbows. Avoid splashing water on uniform.","note":"Avoid splashing on uniform; keep forearms and wrists lower than elbows.","criticalCategory":None,"examScorecard":None},
    {"id":4,"text":"Apply palm-sized soap","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Apply a palm-sized amount of hand soap.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Lather twenty seconds minimum","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Perform hand hygiene using plenty of lather and friction for at least 20 seconds.","subSteps":["Rub hands palm to palm","Rub back of right and left hand (fingers interlaced)","Rub palm to palm with fingers interlaced","Perform rotational rubbing of left and right thumbs","Rub fingertips against palm of opposite hand","Rub wrists","Repeat sequence at least two times"],"criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Keep fingertips pointing down","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Keep fingertips pointing downward throughout.","note":"Credentia absorbs this into Steps 5 & 7 — GWC scores it as a standalone observable action.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Clean under fingernails","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Clean under fingernails.","subSteps":["Rub fingertips against palm of opposite hand"],"criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Rinse fingertips pointing down","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Rinse hands with water, keeping fingertips pointing down so water runs off fingertips. Do not shake water from your hands.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Dry fingertips-to-wrists; dispose towel","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Dry hands thoroughly from fingers to wrists with a paper towel or air dryer. Dispose of the paper towel(s).","criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Turn off water with towel","segment":"core","phaseWord":"Wash","tagCategory":"Core","detailedText":"Use a new paper towel to turn off the water. Dispose of the paper towel.","note":"GWC: paper towel only. Credentia also allows knee/foot control — GWC governs on exam.","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Never lean on or touch sink","segment":"core","phaseWord":"Finish","tagCategory":"Core","detailedText":"Do not lean against the sink or touch the inside of the sink during the hand-washing process.","criticalCategory":None,"examScorecard":None},
  ]
},

"ppe-gown-gloves": {
  "confusionGroupLabel": None,
  "studentFocus": "Isolation skill — no patient intro; gloves off before gown at exit.",
  "steps": [
    {"id":1,"text":"Face gown's back opening","segment":"open","phaseWord":"Don","tagCategory":"Core","detailedText":"Face the back opening of the gown.","criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Unfold the gown","segment":"core","phaseWord":"Don","tagCategory":"Core","detailedText":"Unfold the gown.","criticalCategory":None,"examScorecard":None},
    {"id":3,"text":"Put arms into sleeves","segment":"core","phaseWord":"Don","tagCategory":"Core","detailedText":"Put arms into the sleeves.","criticalCategory":None,"examScorecard":None},
    {"id":4,"text":"Secure neck ties at back","segment":"core","phaseWord":"Don","tagCategory":"Core","detailedText":"Secure the neck opening at the back of neck.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Secure waist; cover back fully","segment":"core","phaseWord":"Don","tagCategory":"Core","detailedText":"Secure the waist, making sure that the back flaps overlap each other and covering clothing as completely as possible.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Don clean gloves","segment":"core","phaseWord":"Don","boilerplateId":"GLOVE_DON","tagCategory":"Key Procedure","detailedText":BP["GLOVE_DON"],"note":"Use clean, non-sterile gloves for isolation care.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Overlap gloves over gown cuffs","segment":"core","phaseWord":"Don","tagCategory":"Core","detailedText":"Ensure the gloves overlap the gown sleeves at the wrist.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Remove gloves before the gown","segment":"core","phaseWord":"Work","tagCategory":"Core","detailedText":"When the care is complete and before leaving the room, remove the gloves BEFORE removing the gown.","note":"Sequence matters: gloves off before gown, before leaving the room — evaluator watches for this order.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Remove gloves inside out","segment":"core","phaseWord":"Doff","boilerplateId":"GLOVE_REMOVE","tagCategory":"Key Procedure","detailedText":BP["GLOVE_REMOVE"],"subSteps":["Grasp outside of first glove at palm; peel off","Slide fingers of bare hand under cuff of remaining glove at wrist; peel off turning inside out"],"criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Dispose gloves in waste container","segment":"core","phaseWord":"Doff","tagCategory":"Core","detailedText":"Dispose of the gloves in the appropriate container.","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Perform hand hygiene now","segment":"core","phaseWord":"Doff","boilerplateId":"HAND_HYGIENE|VIDEO_WARNING","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"note":"⚠️ VIDEO WARNING: This step is missing from the reference video — GWC requires hand hygiene HERE, between glove removal and gown unfastening.","criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":12,"text":"Unfasten gown at neck","segment":"core","phaseWord":"Doff","tagCategory":"Core","detailedText":"Unfasten the gown at the neck.","criticalCategory":None,"examScorecard":None},
    {"id":13,"text":"Unfasten gown at waist","segment":"core","phaseWord":"Doff","tagCategory":"Core","detailedText":"Unfasten the gown at the waist.","criticalCategory":None,"examScorecard":None},
    {"id":14,"text":"Remove gown; soiled side inward","segment":"core","phaseWord":"Doff","tagCategory":"Core","detailedText":"Remove the gown starting at the top of the shoulders, turning it inside out and folding the soiled area to soiled area.","subSteps":["Start at shoulders; pull down","Turn inside out as you remove","Fold soiled area to soiled area","Hold away from body; do not touch floor"],"criticalCategory":None,"examScorecard":None},
    {"id":15,"text":"Dispose gown in waste container","segment":"core","phaseWord":"Doff","tagCategory":"Core","detailedText":"Dispose of the gown in an appropriate container.","criticalCategory":None,"examScorecard":None},
    {"id":16,"text":"Perform final hand hygiene","segment":"close","phaseWord":"Doff","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"radial-pulse-60-seconds": {
  "confusionGroupLabel": "VIT-2 — also see respirations (S03). Same 60-second count window; done back-to-back.",
  "studentFocus": "Full 60 seconds at radial artery; document ±4.",
  "steps": [
    {"id":1,"text":"Introduce and explain","segment":"open","phaseWord":"Introduce","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Locate radial pulse","segment":"core","phaseWord":"Count","tagCategory":"Core","detailedText":"Locate the radial pulse by placing the tips of fingers on the side of the patient's wrist.","criticalCategory":None,"examScorecard":None},
    {"id":3,"text":"Count pulse 60 seconds","segment":"core","phaseWord":"Count","tagCategory":"Core","detailedText":"Count the pulse for 60 seconds.","note":"Start on a whole number on the watch, then count.","criticalCategory":None,"examScorecard":"Exam tolerance: Document pulse ±4 bpm"},
    {"id":4,"text":"Call light within reach","segment":"close","phaseWord":"Record","boilerplateId":"CALL_LIGHT","tagCategory":"Closing","detailedText":BP["CALL_LIGHT"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":5,"text":"Wash hands","segment":"close","phaseWord":"Record","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"note":"Wash before documenting.","criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":6,"text":"Document the rate","segment":"close","phaseWord":"Record","tagCategory":"Closing","detailedText":"Document pulse within plus or minus 4 of the evaluator's result.","criticalCategory":None,"examScorecard":"Exam tolerance: Document pulse ±4 bpm"},
  ]
},

"respirations-60-seconds": {
  "confusionGroupLabel": "VIT-2 — also see radial pulse (S04). Same 60-second window; never announce you're counting.",
  "studentFocus": "Do not tell the patient you are counting respirations.",
  "steps": [
    {"id":1,"text":"Introduce and explain","segment":"open","phaseWord":"Introduce","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"note":"Say 'for testing purposes.' In real practice, never tell the patient you're counting respirations — it changes the rate.","criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Count respirations 60 seconds","segment":"core","phaseWord":"Count","tagCategory":"Core","detailedText":"Count respirations for 60 seconds.","note":"Start on a whole number on the watch, then count.","criticalCategory":None,"examScorecard":"Exam tolerance: Document respirations ±4"},
    {"id":3,"text":"Call light within reach","segment":"close","phaseWord":"Record","boilerplateId":"CALL_LIGHT","tagCategory":"Closing","detailedText":BP["CALL_LIGHT"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":4,"text":"Wash hands","segment":"close","phaseWord":"Record","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"note":"Wash before documenting.","criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":5,"text":"Document the rate","segment":"close","phaseWord":"Record","tagCategory":"Closing","detailedText":"Document respiratory rate within plus or minus 4 of the evaluator's result.","criticalCategory":None,"examScorecard":"Exam tolerance: Document respirations ±4"},
  ]
},

"manual-blood-pressure": {
  "confusionGroupLabel": None,
  "studentFocus": "Cuff on bare skin; cleanse equipment; document ±8 mmHg.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Prepare","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Perform hand hygiene","segment":"open","phaseWord":"Prepare","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":3,"text":"Cleanse stethoscope and cuff","segment":"core","phaseWord":"Prepare","tagCategory":"Core","detailedText":"Cleanse the stethoscope and blood pressure cuff prior to placing it on the patient's skin.","criticalCategory":None,"examScorecard":None},
    {"id":4,"text":"Position patient; arm at heart level","segment":"core","phaseWord":"Prepare","tagCategory":"Core","detailedText":"Place the patient in a relaxed reclining or sitting position. Ask the patient which arm they prefer. Both feet should be on the floor and the arm should be supported at heart level.","note":"Ask which arm the patient prefers.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Bare skin under cuff","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Remove or rearrange clothing so the cuff and the stethoscope are on bare skin.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Center cuff over brachial artery","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Center the bladder of the blood pressure cuff over the brachial artery with the lower margin 1″ above the antecubital space. Fit the cuff evenly and snugly. Palpate the brachial artery in the antecubital space.","note":"Lower cuff margin sits 1″ above the elbow bend.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Inflate cuff 160–180 mmHg","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Inflate the cuff to 160–180 mmHg.","note":"If a beat is heard immediately on deflation, fully deflate, wait 1 min, reinflate to no more than 200.","criticalCategory":None,"examScorecard":"Technique: Inflate cuff 160–180 mmHg"},
    {"id":8,"text":"Deflate slowly; note systolic","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Deflate the cuff gradually at a constant rate by opening the valve on the bulb (2–3 mmHg/second) until the first Korotkoff sound is heard. Note the systolic pressure.","criticalCategory":None,"examScorecard":"Technique: Deflate rate 2–3 mmHg/second (systolic)"},
    {"id":9,"text":"Continue deflating; note diastolic","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Continue to deflate the cuff slowly at 2 mmHg/second. Note the point at which Korotkoff sounds disappear completely as the diastolic pressure.","criticalCategory":None,"examScorecard":"Technique: Deflate rate 2 mmHg/second (diastolic)"},
    {"id":10,"text":"Deflate fully; remove cuff","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Deflate the cuff completely and remove the cuff from the patient's arm.","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Tell patient the reading","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Inform the patient of the blood pressure reading.","criticalCategory":None,"examScorecard":None},
    {"id":12,"text":"Cleanse stethoscope and cuff","segment":"core","phaseWord":"Record","tagCategory":"Core","detailedText":"Cleanse the stethoscope and blood pressure cuff.","criticalCategory":None,"examScorecard":None},
    {"id":13,"text":"Perform hand hygiene","segment":"close","phaseWord":"Record","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":14,"text":"Document BP within ±8 mmHg","segment":"close","phaseWord":"Record","tagCategory":"Closing","detailedText":"Document both systolic and diastolic pressures each within plus or minus 8 mmHg of the evaluator's reading.","note":"Both numbers must each be within ±8 mmHg.","criticalCategory":None,"examScorecard":"Exam tolerance: Document BP ±8 mmHg (systolic AND diastolic)"},
  ]
},

"weight-ambulatory-client": {
  "confusionGroupLabel": None,
  "studentFocus": "Zero scale; nonskid footwear; document ±2 lbs.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Prepare","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Perform hand hygiene","segment":"open","phaseWord":"Prepare","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":3,"text":"Verify nonskid footwear on patient","segment":"core","phaseWord":"Prepare","tagCategory":"Core","detailedText":"Verify the patient is wearing nonskid footwear.","criticalCategory":None,"examScorecard":None},
    {"id":4,"text":"Balance (zero) the scale","segment":"core","phaseWord":"Prepare","tagCategory":"Core","detailedText":"Balance (or zero) scale.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Walk patient to the scale","segment":"core","phaseWord":"Weigh","tagCategory":"Core","detailedText":"Walk the patient to the scale.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Assist patient onto the scale","segment":"core","phaseWord":"Weigh","tagCategory":"Core","detailedText":"Assist the patient to step on the scale.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Check patient centered on scale","segment":"core","phaseWord":"Weigh","tagCategory":"Core","detailedText":"Check that the patient is centered on the scale.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Check arms at patient's side","segment":"core","phaseWord":"Weigh","tagCategory":"Core","detailedText":"Check that the patient has their arms at their side.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Ensure patient holds nothing extra","segment":"core","phaseWord":"Weigh","tagCategory":"Core","detailedText":"Ensure the patient is not holding on to anything that would alter the reading of the weight.","criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Adjust weights; balance the scale","segment":"core","phaseWord":"Weigh","tagCategory":"Core","detailedText":"Adjust the weights until the scale is in balance or read analog scale.","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Perform hand hygiene","segment":"close","phaseWord":"Record","boilerplateId":"HAND_HYGIENE","tagCategory":"Closing","detailedText":BP["HAND_HYGIENE"],"criticalCategory":None,"examScorecard":None},
    {"id":12,"text":"Document weight within ±2 lb","segment":"close","phaseWord":"Record","tagCategory":"Closing","detailedText":"Document weight (plus/minus 2 lbs. or 0.9 kg).","note":"Tolerance: record weight within ±2 lb / 0.9 kg of actual.","criticalCategory":None,"examScorecard":"Exam tolerance: Document weight ±2 lb / 0.9 kg"},
    {"id":13,"text":"Perform hand hygiene","segment":"close","phaseWord":"Record","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"urinary-output-measurement": {
  "confusionGroupLabel": None,
  "studentFocus": "Measure in container — not the same as full bedpan skill.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Prepare","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Perform hand hygiene","segment":"open","phaseWord":"Prepare","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":3,"text":"Don clean gloves","segment":"core","phaseWord":"Prepare","boilerplateId":"GLOVE_DON","tagCategory":"Key Procedure","detailedText":BP["GLOVE_DON"],"criticalCategory":None,"examScorecard":None},
    {"id":4,"text":"Pour bedpan liquid into container","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Pour the liquid in the bedpan into a measuring container.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Rinse bedpan; empty into toilet","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Rinse the bedpan and empty the water into the toilet.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Measure urine at eye level","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Measure the amount of urine at eye level with the container on a flat surface.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Empty urine into toilet","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Empty the urine into the toilet.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Rinse container; empty into toilet","segment":"core","phaseWord":"Measure","tagCategory":"Core","detailedText":"Rinse the measuring container with water and empty it into the toilet.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Remove gloves inside out","segment":"core","phaseWord":"Record","boilerplateId":"GLOVE_REMOVE","tagCategory":"Key Procedure","detailedText":BP["GLOVE_REMOVE"],"criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Record volume ±25 mL","segment":"close","phaseWord":"Record","tagCategory":"Closing","detailedText":"Record the volume within plus or minus 25 mL of the actual volume.","note":"Tolerance: record urine volume within ±25 mL of actual.","criticalCategory":None,"examScorecard":"Exam tolerance: Record volume ±25 mL"},
    {"id":11,"text":"Perform hand hygiene","segment":"close","phaseWord":"Record","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"position-on-side": {
  "confusionGroupLabel": None,
  "studentFocus": "Bed-based, lowest-risk movement. Pillow support after turning is a scored point.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Approach","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Provide for privacy","segment":"open","phaseWord":"Approach","boilerplateId":"PRIVACY","tagCategory":"Opening","detailedText":BP["PRIVACY"],"criticalCategory":"privacy","examScorecard":None},
    {"id":3,"text":"Perform hand hygiene","segment":"open","phaseWord":"Approach","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":4,"text":"Position bed flat","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Position the bed flat.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Raise bed to working height","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Raise the bed height.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Raise far side rail for safety","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Raise the side rail on the side of the bed the patient will be facing after repositioning for safety.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Move to working side of bed","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Move to the working side of the bed, which is opposite the side rail that was raised.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Explain move toward you on three","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Explain to the patient that you will move them closer before turning on the count of three.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Count three; move patient toward you","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"From the working side of the bed count to three and move the patient towards you.","criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Instruct patient to move near arm","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Instruct the patient to move their arm closest to the raised side rail away from their body.","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Raise patient's near knee to assist","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Raise the patient's knee that is closest to you to assist in turning.","criticalCategory":None,"examScorecard":None},
    {"id":12,"text":"Explain turning toward rail on three","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Explain that you will turn the patient towards the side rail on count three.","criticalCategory":None,"examScorecard":None},
    {"id":13,"text":"Count three; turn toward side rail","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Count to three to turn the patient towards the raised side rail.","criticalCategory":None,"examScorecard":None},
    {"id":14,"text":"Guard face from rail and pillow","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Ensure that the patient's face never comes close to the side rail or becomes covered by the pillow.","criticalCategory":None,"examScorecard":None},
    {"id":15,"text":"Check patient not on bottom arm","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Check that the patient is not lying on their bottom arm.","criticalCategory":None,"examScorecard":None},
    {"id":16,"text":"Place pillow behind patient's back","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Place a pillow behind the patient's back, ensuring they will not roll back to the supine position.","criticalCategory":None,"examScorecard":None},
    {"id":17,"text":"Check body alignment from bed end","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Move to the end of the bed and check that the patient is in correct body alignment.","criticalCategory":None,"examScorecard":None},
    {"id":18,"text":"Verify patient centered in bed","segment":"core","phaseWord":"Position","tagCategory":"Core","detailedText":"Verify that the patient is in the middle of the bed.","criticalCategory":None,"examScorecard":None},
    {"id":19,"text":"Pillow under top arm; protect ribs","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Place a pillow between the patient's top arm and their rib cage or the bed, ensuring the elbow is not directly on their ribs.","criticalCategory":None,"examScorecard":None},
    {"id":20,"text":"Pillow under top knee; protect ankles","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Place a pillow under the top knee, ensuring the knee is not resting directly on the other knee or the ankle is not on top of the other ankle.","criticalCategory":None,"examScorecard":None},
    {"id":21,"text":"Adjust head pillow for comfort","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Adjust the pillow under the patient's head for comfort.","criticalCategory":None,"examScorecard":None},
    {"id":22,"text":"Lower bed; lock brakes","segment":"close","phaseWord":"Secure","boilerplateId":"BED_LOW","tagCategory":"Closing","detailedText":BP["BED_LOW"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":23,"text":"Place call light in reach","segment":"close","phaseWord":"Secure","boilerplateId":"CALL_LIGHT","tagCategory":"Closing","detailedText":BP["CALL_LIGHT"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":24,"text":"Perform hand hygiene","segment":"close","phaseWord":"Secure","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"bed-wheelchair-transfer": {
  "confusionGroupLabel": "MOVE-2 — also see ambulate-transfer-belt. Same belt grip, same dangle, different destination.",
  "studentFocus": "Nonskid footwear; gait belt; ask about dizziness; strong side toward wheelchair.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Approach","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Provide for privacy","segment":"open","phaseWord":"Approach","boilerplateId":"PRIVACY","tagCategory":"Opening","detailedText":BP["PRIVACY"],"criticalCategory":"privacy","examScorecard":None},
    {"id":3,"text":"Perform hand hygiene","segment":"open","phaseWord":"Approach","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":4,"text":"Check bed brakes are locked","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Check the brakes on the bed to ensure they are locked.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Remove wheelchair foot pedals if needed","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Remove the foot pedals from the wheelchair if needed.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Assist patient to sit; dangle feet","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Assist the patient to a seated position on the side of the bed with their feet on the floor; allow them to dangle their feet for a few minutes.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Apply nonskid footwear to patient","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Assist the patient in putting on nonskid footwear.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Apply gait belt to patient","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Place the gait belt on the patient.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Position wheelchair; strong side toward it","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Position the wheelchair at the head or foot of the bed so the patient will move towards the wheelchair with the stronger side of their body. The wheelchair should touch the side of the bed.","criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Lock wheelchair brakes","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Lock the brakes on the wheelchair.","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Ask if patient feels dizzy","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Ask the patient if they feel dizzy or light-headed.","criticalCategory":None,"examScorecard":None},
    {"id":12,"text":"Block patient's feet with yours","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Face the patient and place each of your feet in front of the patient's feet to prevent them from slipping.","criticalCategory":None,"examScorecard":None},
    {"id":13,"text":"Patient pushes up on three","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Instruct the patient to push up on the bed to aid in standing on the count of three.","criticalCategory":None,"examScorecard":None},
    {"id":14,"text":"Grasp gait belt; palms up","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Grasp the gait belt with both hands, with palms and fingertips pointing up.","criticalCategory":None,"examScorecard":None},
    {"id":15,"text":"Count three; assist patient to stand","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Count to three and assist the patient to stand.","criticalCategory":None,"examScorecard":None},
    {"id":16,"text":"Assist patient to pivot","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Assist the patient to pivot.","criticalCategory":None,"examScorecard":None},
    {"id":17,"text":"Instruct patient to grasp wheelchair arms","segment":"core","phaseWord":"Transfer","tagCategory":"Core","detailedText":"Instruct the patient to grasp the arms of the wheelchair when they can feel the back of their knees are in contact with the wheelchair seat.","criticalCategory":None,"examScorecard":None},
    {"id":18,"text":"Assist patient to seated in wheelchair","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Assist the patient to a seated position in the wheelchair.","criticalCategory":None,"examScorecard":None},
    {"id":19,"text":"Remove gait belt gently","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Remove the gait belt gently to avoid skin injury.","criticalCategory":None,"examScorecard":None},
    {"id":20,"text":"Release wheelchair brakes","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Release the wheelchair brakes.","criticalCategory":None,"examScorecard":None},
    {"id":21,"text":"Place call light in reach","segment":"close","phaseWord":"Secure","boilerplateId":"CALL_LIGHT","tagCategory":"Closing","detailedText":BP["CALL_LIGHT"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":22,"text":"Perform hand hygiene","segment":"close","phaseWord":"Secure","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"ambulate-transfer-belt": {
  "confusionGroupLabel": "MOVE-2 — also see bed-wheelchair-transfer. Same belt grip; patient stays upright and walks 10 ft.",
  "studentFocus": "Nonskid footwear; gait belt; ask about dizziness.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Approach","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Provide for patient privacy","segment":"open","phaseWord":"Approach","boilerplateId":"PRIVACY","tagCategory":"Opening","detailedText":BP["PRIVACY"],"criticalCategory":"privacy","examScorecard":None},
    {"id":3,"text":"Perform hand hygiene","segment":"open","phaseWord":"Approach","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":4,"text":"Place nonskid footwear on patient","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Place nonskid footwear on the patient.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Adjust bed to safe level","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Adjust the bed to a safe level.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Check bed brakes are locked","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Check the brakes of the bed to ensure they are locked.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Dangle patient on bed edge","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Allow the patient to sit and dangle on the edge of the bed before standing to ambulate.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Ask if dizzy or light-headed","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Ask the patient if they feel dizzy or light-headed.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Apply gait belt; check tightness","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Properly place the gait belt around the patient's waist and check the gait belt for tightness by slipping fingers between the gait belt and the patient.","criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Face patient; block patient's feet","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Face the patient and place each of the feet in front of the patient's feet to prevent them from slipping.","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Instruct patient to push up","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Instruct the patient to push up on the bed on the count of three to assist with standing.","criticalCategory":None,"examScorecard":None},
    {"id":12,"text":"Count three; assist to standing","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Count to three and assist the patient to a standing position.","criticalCategory":None,"examScorecard":None},
    {"id":13,"text":"Move to weak side; hold belt","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Move to the weak side of the patient, slightly behind them. Hold the gait belt with palms and fingertips pointing upwards.","criticalCategory":None,"examScorecard":None},
    {"id":14,"text":"Assist patient in standing position","segment":"core","phaseWord":"Ambulate","tagCategory":"Core","detailedText":"Assist the patient in a standing position.","criticalCategory":None,"examScorecard":None},
    {"id":15,"text":"Walk behind; hold belt 10 ft","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Walk slightly behind the patient for a distance of 10 feet while safely holding the transfer belt.","criticalCategory":None,"examScorecard":None},
    {"id":16,"text":"Assist back to bed; remove belt","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Safely assist the client back to bed and remove the transfer belt.","criticalCategory":None,"examScorecard":None},
    {"id":17,"text":"Call light; bed low and locked","segment":"close","phaseWord":"Secure","boilerplateId":"BED_LOW|CALL_LIGHT","tagCategory":"Closing","detailedText":"Place the call light (or signaling device) within reach of the patient. Lower the bed to its lowest position and verify the bed brakes are locked.","criticalCategory":"bed-call-light","examScorecard":None},
    {"id":18,"text":"Perform hand hygiene","segment":"close","phaseWord":"Secure","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"prom-shoulder": {
  "confusionGroupLabel": "ROM-2 — also see prom-knee-ankle. Same pain-stop rule; different joint.",
  "studentFocus": "Same pain rules as knee/ankle PROM.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Approach","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Provide for patient privacy","segment":"open","phaseWord":"Approach","boilerplateId":"PRIVACY","tagCategory":"Opening","detailedText":BP["PRIVACY"],"criticalCategory":"privacy","examScorecard":None},
    {"id":3,"text":"Perform hand hygiene","segment":"open","phaseWord":"Approach","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":4,"text":"Advise patient to report pain","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Advise patients to report pain during movement.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Place hand under patient's elbow","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Place one hand under the patient's elbow with palm facing up.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Place hand under patient's wrist","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Place the other hand under the patient's wrist with palm facing up.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Watch for signs of pain","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Watch the patient for objective signs of pain during movement.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Move arm gently; stop resistance","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Move their arms gently and stop if there is any resistance.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Raise arm overhead (flexion)","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"While keeping the patient's arm straight, raise their arm up and over their head (i.e., flexion).","criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Return arm to side (extension)","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Bring the patient's arm back down to their side (i.e., extension).","criticalCategory":None,"examScorecard":None},
    {"id":11,"text":"Complete flexion/extension per care plan","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Complete flexion and extension movements of the shoulder according to the order in the restorative care plan.","criticalCategory":None,"examScorecard":None},
    {"id":12,"text":"Continue supporting elbow and wrist","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Continue to support the elbow and wrist of the patient.","criticalCategory":None,"examScorecard":None},
    {"id":13,"text":"Move arm away from body (abduction)","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Keeping the patient's arm straight, move their entire arm out away from the body (i.e., abduction).","criticalCategory":None,"examScorecard":None},
    {"id":14,"text":"Move arm gently; stop resistance","segment":"core","phaseWord":"Shoulder","tagCategory":"Core","detailedText":"Move their arms gently and stop if there is any resistance.","criticalCategory":None,"examScorecard":None},
    {"id":15,"text":"Return arm to side (adduction)","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Return the patient's arm to their side (adduction).","criticalCategory":None,"examScorecard":None},
    {"id":16,"text":"Lower bed; lock brakes","segment":"close","phaseWord":"Secure","boilerplateId":"BED_LOW","tagCategory":"Closing","detailedText":BP["BED_LOW"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":17,"text":"Place call light in reach","segment":"close","phaseWord":"Secure","boilerplateId":"CALL_LIGHT","tagCategory":"Closing","detailedText":BP["CALL_LIGHT"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":18,"text":"Perform hand hygiene","segment":"close","phaseWord":"Secure","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"prom-knee-ankle": {
  "confusionGroupLabel": "ROM-2 — also see prom-shoulder. Same pain-stop rule; lower body two joints.",
  "studentFocus": "Stop ROM if patient reports pain.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Approach","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Provide for patient privacy","segment":"open","phaseWord":"Approach","boilerplateId":"PRIVACY","tagCategory":"Opening","detailedText":BP["PRIVACY"],"criticalCategory":"privacy","examScorecard":None},
    {"id":3,"text":"Perform hand hygiene","segment":"open","phaseWord":"Approach","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":4,"text":"Advise patient to report pain","segment":"core","phaseWord":"Lower","tagCategory":"Core","detailedText":"Advise patients to report pain during movement.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Hip abduction and adduction","segment":"core","phaseWord":"Lower","tagCategory":"Core","detailedText":"Abduction/Adduction for Hip: Keeping the patient's leg straight, gently move their entire leg away from their body (i.e., abduction). Move their legs gently and stop if there is any resistance.","subSteps":["Keeping the patient's leg straight, gently move their entire leg away from their body (abduction)","Move their legs gently and stop if there is any resistance","Ask the patient if they are experiencing any pain during movement","Stop ROM if the patient reports pain or displays objective signs of pain","Keeping the patient's leg straight, move their entire leg toward their body (adduction)","Complete abduction and adduction movements of the hip according to the order in their restorative care plan","Continue to correctly support joints by keeping one hand under the patient's knee and the other hand under the patient's ankle"],"criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Knee and hip flexion/extension","segment":"core","phaseWord":"Lower","tagCategory":"Core","detailedText":"Flexion/Extension of Knee and Hip: Bend the patient's knee and hip up toward the patient's trunk (i.e., flexion). Straighten their knee and hip (i.e., extension).","subSteps":["Bend the patient's knee and hip up toward the patient's trunk (flexion of hip and knee at the same time)","Move the patient's leg gently and stop if there is any resistance","Ask the patient if they are experiencing any pain during movement","Stop ROM if the patient reports pain or displays objective signs of pain","Straighten their knee and hip (extension of knee and hip at the same time)","Complete flexion and extension movements of the knee and hip according to the order in the restorative care plan"],"criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Lower bed; lock brakes","segment":"close","phaseWord":"Secure","boilerplateId":"BED_LOW","tagCategory":"Closing","detailedText":BP["BED_LOW"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":8,"text":"Place call light in reach","segment":"close","phaseWord":"Secure","boilerplateId":"CALL_LIGHT","tagCategory":"Closing","detailedText":BP["CALL_LIGHT"],"criticalCategory":"bed-call-light","examScorecard":None},
    {"id":9,"text":"Perform hand hygiene","segment":"close","phaseWord":"Secure","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},

"knee-high-stocking": {
  "confusionGroupLabel": "CLOTH-2 — also see dress-weak-right-arm. Both involve careful limb handling; different garment.",
  "studentFocus": "Turn stocking inside out to heel.",
  "steps": [
    {"id":1,"text":"Introduce and explain procedure","segment":"open","phaseWord":"Approach","boilerplateId":"INTRO_EXPLAIN","tagCategory":"Opening","detailedText":BP["INTRO_EXPLAIN"],"criticalCategory":None,"examScorecard":None},
    {"id":2,"text":"Provide for patient privacy","segment":"open","phaseWord":"Approach","boilerplateId":"PRIVACY","tagCategory":"Opening","detailedText":BP["PRIVACY"],"criticalCategory":"privacy","examScorecard":None},
    {"id":3,"text":"Perform hand hygiene","segment":"open","phaseWord":"Approach","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
    {"id":4,"text":"Position patient supine; expose leg","segment":"core","phaseWord":"Apply","tagCategory":"Core","detailedText":"Position the patient in the supine position. Expose only the leg the candidate will be placing the stocking on.","criticalCategory":None,"examScorecard":None},
    {"id":5,"text":"Turn stocking inside out to heel","segment":"core","phaseWord":"Apply","tagCategory":"Core","detailedText":"Gather supplies and turn the stocking inside out to the heel.","criticalCategory":None,"examScorecard":None},
    {"id":6,"text":"Place stocking over toes and heel","segment":"core","phaseWord":"Apply","tagCategory":"Core","detailedText":"Place the stocking over the patient's toes, foot, and heel.","criticalCategory":None,"examScorecard":None},
    {"id":7,"text":"Pull stocking up the leg","segment":"core","phaseWord":"Apply","tagCategory":"Core","detailedText":"Gently pull the stocking up their leg.","criticalCategory":None,"examScorecard":None},
    {"id":8,"text":"Move foot/leg gently; avoid force","segment":"core","phaseWord":"Apply","tagCategory":"Core","detailedText":"Move foot and leg gently and naturally, avoiding force and over-extension of limb and joints.","criticalCategory":None,"examScorecard":None},
    {"id":9,"text":"Adjust stocking wrinkle-free to knee","segment":"core","phaseWord":"Secure","tagCategory":"Core","detailedText":"Adjust stocking; stocking should be wrinkle-free to the knee.","criticalCategory":None,"examScorecard":None},
    {"id":10,"text":"Call light; bed low and locked","segment":"close","phaseWord":"Secure","boilerplateId":"BED_LOW|CALL_LIGHT","tagCategory":"Closing","detailedText":"Place the call light (or signaling device) within reach of the patient. Lower the bed to its lowest position and verify the bed brakes are locked.","criticalCategory":"bed-call-light","examScorecard":None},
    {"id":11,"text":"Perform hand hygiene","segment":"close","phaseWord":"Secure","boilerplateId":"HAND_HYGIENE","tagCategory":"Key Procedure","detailedText":BP["HAND_HYGIENE"],"criticalCategory":"hand-hygiene","examScorecard":None},
  ]
},
}

print("Core data built for", len(SKILLS_ENRICHED), "skills")
print("Keys:", list(SKILLS_ENRICHED.keys()))