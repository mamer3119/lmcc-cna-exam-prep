

# LMCC CNA Skills — Complete Cursor AI Build Guide

## Phase 1: Learn + Test-Yourself (Full Spec from Live App Audit)

---

## Current State Audit (What I See in Your App Right Now)

Before any build instructions — here's what exists and what's broken, so Cursor has a precise delta:

**What's working:**

- 7 phases rendered (PROTECT / OBSERVE / MOVE / RESTORE / CLEAN / FEED / ELIMINATE) with skill counts
- Step-level checkboxes with OPENING / CORE / CLOSING / KEY PROCEDURE labels
- `⚠️ Critical` flags on individual steps
- Coaching notes, exam notes, sub-steps all rendering
- "I've got this" mastery toggle per skill
- Template IDs (T1–T5) + variant labels visible
- Student Focus panels rendering

**What's broken or missing:**

- **Step count bug:** Hand Hygiene shows `0 of 19` — should be `0 of 11` (SCORED steps only)
- PPE shows `0 of 22` — same miscounting issue
- No Learn vs. Test-Yourself mode toggle
- No drag-and-drop sequence drill
- No ⌘K command palette
- `REGIONAL-TESTING-CENTER.pdf` source citations leaking into student view (Step 9 PPE, Step 6 Pulse, etc.)
- No phase left-rail sticky map
- No dark mode
- No print stylesheet
- All 22 skills are inlined on one scroll — no lazy loading
- Mastery state counts say `0 / 22` with `Study Days: 2` — hydration or persistence bug likely

---

## The Cursor Prompt (Paste This Verbatim)

```
text
```

`# LMCC CNA Skills — Phase 1 Build Spec # Cursor: Read this entire file before writing a single line of code. # After EACH numbered milestone, stop, run npm run build, and wait for sign-off.  ---  ## 0. What You're Building  A best-in-class LEARN + SELF-TEST tool for 22 California CNA skills at:   http://localhost:3005/lmcc-cna-exam-prep/study/  Stack: Next.js App Router · Static export · TypeScript strict · Tailwind · localStorage Add ONLY: @dnd-kit/core, @dnd-kit/sortable, motion Do NOT add backends, auth, scoring engines, or databases — that's Phase 2/3. But BUILD the data layer and state store so Phase 2 slots in with zero refactor.  ---  ## 1. Data Layer Refactor (Milestone 1 — do first, invisible to student)  ### 1a. Type definitions Create types/skill.ts:  ```typescript export type Phase = 'OPENING' | 'CORE' | 'CLOSING' | 'KEY_PROCEDURE'; export type PhaseCategory = 'PROTECT' | 'OBSERVE' | 'MOVE' | 'RESTORE' | 'CLEAN' | 'FEED' | 'ELIMINATE'; export type TemplateId = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';  export interface ExamNote {   authority: 'GWC' | 'Credentia';   text: string;   source?: string; // NEVER render in student view — instructor only }  export interface Step {   n: number;   title: string;   phase: Phase;   scored: boolean;       // TRUE = counts toward the mastery denominator   critical?: boolean;    // TRUE = ⚠️ auto-fail   instruction: string;   substeps?: string[];   examNote?: ExamNote;   coachingNote?: string;   failRule?: string;     // e.g. "≥20s, repeat ≥2×"   linkedSkillId?: string; // for embedded hand-hygiene chips }  export interface Skill {   id: string;   title: string;   category: PhaseCategory;   alwaysTested: boolean;   studentFocus: string;   templateId: TemplateId;   templateHint: string;   // The "you already know: ..." text   phases: Step[]; } ```  ### 1b. Fix the step-count bug — CRITICAL Current bug: Hand Hygiene shows "0 of 19" — WRONG. Correct rule: denominator = steps where scored: true. - Hand Hygiene SCORED steps = 11 (Steps 2–11, all CORE). Step 1 (Introduce/ID) is OPENING = not scored. - PPE SCORED steps = count only CORE steps, not OPENING/CLOSING. - Every skill: count only step.scored === true for the denominator. - Fix this on ALL THREE pages: /study/, /skills/[id]/, and the index /. - Verify: after fix, Hand Hygiene shows "0 of 11 steps."  ### 1c. useMasteryStore (Zustand + localStorage) Create store/useMasteryStore.ts:  ```typescript // Shape — do NOT change this interface in Phase 1 (Phase 2 will extend it) interface SkillMastery {   checkedSteps: string[];     // step IDs checked in Learn mode   drilledSteps: string[];     // step IDs completed in any drill   mode: 'learn' | 'drill';   lastSeen: number;           // epoch ms   selfMarkedGotIt: boolean;   // "I've got this" toggle }  interface MasteryStore {   skills: Record<string, SkillMastery>;   isHydrated: boolean;        // SSG guard — never read localStorage before this is true   // actions   toggleStep: (skillId: string, stepId: string) => void;   markDrilled: (skillId: string, stepId: string) => void;   setMode: (skillId: string, mode: 'learn' | 'drill') => void;   setGotIt: (skillId: string, val: boolean) => void;   resetSkill: (skillId: string) => void; } ```  Hydration guard pattern (required for static export): ```typescript // In store: onRehydrateStorage: () => (state) => { state.isHydrated = true }  // In any component that reads store: const isHydrated = useMasteryStore(s => s.isHydrated); if (!isHydrated) return <SkeletonRow />; ```  All three pages /study/, /skills/[id]/, /) must derive counts from this store — no local useState for mastery.  ### 1d. Embedded Hand Hygiene chip Any skill that embeds hand hygiene as steps should instead render a single chip:`

🧼 Hand hygiene — see Skill 1

```
text
```

`This chip links to /lmcc-cna-exam-prep/skills/hand-hygiene. The chip counts as ONE step toward that skill's scored total — NOT 11. The hand hygiene score tracks separately in useMasteryStore under its own skillId.  ### 1e. Instructor view flag Add ?instructor=true query param (or a locked toggle in dev only). When instructorView === false (default for students): - NEVER render examNote.source (the PDF filenames: REGIONAL-TESTING-CENTER.pdf, ALL-TRANSCRIPTS-S01-S22.md) - These are currently leaking into student view — fix immediately. When instructorView === true: - Show source as a small gray chip after the exam note text.  ---  ## 2. Design Tokens (globals.css + tailwind.config.ts — use EXACTLY these)  ```css /* globals.css */ :root {   --bg:              #FAFAF7;   --surface:         #FFFFFF;   --surface-sunken:  #F4F3EE;   --border:          #E5E3DC;   --text:            #1A1A17;   --text-muted:      #6B6862;   --text-faint:      #9C988F;    /* Phase accents */   --phase-protect:   #B4452F;   --phase-observe:   #2F6FB4;   --phase-move:      #2F8F6B;   --phase-restore:   #7A5CB4;   --phase-clean:     #2FA3B4;   --phase-feed:      #C08A2F;   --phase-eliminate: #B42F7A;    /* Functional */   --critical:        #C2371F;   --critical-bg:     #FBEEEC;   --core:            #2F6FB4;   --success:         #2F8F6B;   --success-bg:      #ECF6F1;   --error:           #C2371F;   --mastered:        #1E7A52;    /* Radius */   --radius-card:     14px;   --radius-chip:     999px;   --radius-btn:      10px; }  .dark {   --bg: #16150F; --surface: #211F18; --surface-sunken: #1B1A13;   --border: #34322A; --text: #F2F0E8; --text-muted: #A9A498;   /* phase/functional hues: same hex, but raise lightness ~12% — use Tailwind dark: variants */ } ```  ```typescript // tailwind.config.ts — extend theme.colors with all CSS vars above // Also add: fontFamily: { serif: ['Newsreader', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'sans-serif'] } // All tabular numbers: fontVariantNumeric: 'tabular-nums' // apply via class tnum on all step counts/percentages ```  Typography scale (apply as Tailwind utilities or extend): - Skill title: text-[28px] leading-[32px] font-serif - Section header: text-[18px] leading-[24px] font-semibold - Body: text-[15px] leading-[22px] - Label/chip: text-[11px] leading-[14px] uppercase tracking-widest  Spacing: 4px base grid. Stick to multiples of 4 everywhere.  Shadow (light mode only): ```css .card-shadow { box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04); } ```  ---  ## 3. LEARN MODE — Layout and Display Rules  ### Phase section structure`

[Phase accent dot] PROTECT                        ← phase eyebrow, uppercase, --text-faint  
Infection Control                                 ← category subtitle  
─────────────────────────────────────────────────  
[Skill card]  
Hand Hygiene (Hand Washing)                   ← serif title  
T4 · Identify Variant                         ← chip row  
[Student Focus panel — --surface-sunken bg]  
─────────────────  
OPENING  (--text-muted, dimmed label)  
Step 1: Introduce and identify the patient  ← ⚠️ Critical  
─────────────────  
CORE  (--core accent label, visually emphasized block)  
Step 2: Turn on warm water  
Step 3: Wet hands below elbows  
...  
─────────────────  
CLOSING  (--text-muted, dimmed)  
(none for hand hygiene)

```
text
```

`### Step row anatomy Each step row contains in order: 1. Step number — tabular font, --text-faint, width: 28px fixed 2. Checkbox (44px tap target) 3. Step title — --text weight 500 4. Phase tag chip — filled, 12% opacity background of phase accent, accent text 5. If critical: true → ⚠️ Critical pill in --critical / --critical-bg 6. If failRule → small monospace data chip below title: ≥20s, repeat ≥2× 7. If coachingNote → italic --text-muted line, prefixed with small Coach tag 8. If examNote → Authority badge: GWC (solid --core) or Credentia (outline). Show text. NEVER show examNote.source in student view.  ### Critical step styling (always applied, no toggle) ```css .step-critical {   background: var(--critical-bg);   border-left: 3px solid var(--critical);   border-radius: 0 8px 8px 0; } ``` Do NOT use full red background fills — only left border + bg tint.  ### Sub-steps Render as indented list under parent step, same checkbox pattern, 4px smaller text. Sub-steps are NOT scored independently — only their parent step is scored.  ### Animations (motion) On mount, step rows animate once: ```typescript // variants const stepVariant = {   hidden: { opacity: 0, y: 12 },   visible: (i: number) => ({     opacity: 1, y: 0,     transition: { delay: i * 0.03, duration: 0.18, ease: 'easeOut' }   }) } // Wrap in: @media (prefers-reduced-motion: reduce) → disable y transform, keep opacity only ```  ---  ## 4. TEST-YOURSELF MODE — Three Drills  ### Mode toggle Segmented control at top of skill card: [ Learn ]  [ Test Yourself ] Pill highlight slides between segments using motion layout animation, 200ms spring. mode persists to useMasteryStore for this skillId.  ### Drill 1 — Sequence Reconstruction (build first) Source: @dnd-kit/sortable  Setup: - Take only scored: true steps - Shuffle with Fisher-Yates on drill init (seed from Date.now()) - Render as vertical sortable list with drag handle on left (≥44px target)  Drag behavior: - On drag start: item lifts, scale: 1.02, box-shadow elevates, 150ms - On drop: spring settle, { stiffness: 300, damping: 25 } - Keyboard sensor required (dnd-kit KeyboardSensor) - aria-live="polite" region announces: "Step [n] moved to position [n]"  "Check Order" button: - Compare student array to canonical scored step order - Correct step: flash --success-bg 250ms → settle, render small ✓ icon inline - Misplaced step: flash --error-bg + horizontal shake animation:   ```typescript   // motion keyframes   x: [0, -6, 6, -6, 6, 0], transition: { duration: 0.2, times: [0,.2,.4,.6,.8,1] }   ``` - Misplaced CRITICAL step: same shake + persistent --critical left border + inline note pulled from examNote.text or coachingNote - NO score shown. Show: "[n] correct, [n] to fix" is fine. Reason only. - "Try again" reshuffles only the misplaced steps back into the list, correct ones lock in place  ### Drill 2 — Critical-Tolerance Recall Source: steps where failRule !== undefined  For each failRule step: - Show cue card: "How long must you lather?" (derive from step title + failRule) - Student types answer OR selects from 3 options (generate distractors from nearby numeric values) - On correct: --success-bg check + display official instruction text - On wrong: --error-bg + reveal answer + one-line why-it-fails (from coachingNote or examNote.text) - Card flip on reveal: rotateY(0deg → 90deg → 0deg), 300ms, preserve-3d - prefers-reduced-motion: crossfade instead of flip  ### Drill 3 — Free-Recall Self-Quiz - Show step instruction text hidden behind a "Reveal" button - Student reads, then taps: Got it ✓ or Missed it ✗ - "Missed it" steps collect into a sticky tray at bottom: Redrill these (n) - End state: list missed steps only + Drill missed steps button (re-runs Drill 3 with subset) - No percentage. No score. Just: what to redrill.  ---  ## 5. Shared UI Components  ### Phase left-rail map - 7 phase dots, sticky, left side on desktop / horizontal scroll on mobile - Current visible phase: filled with phase accent color - Others: outline only, same accent - Click/tap: smooth scroll to that phase section - Derive active phase from IntersectionObserver on phase headers  ### ⌘K Command Palette On Cmd+K / Ctrl+K: - Overlay with input field - Options: all 22 skill names + "Start sequence drill on [skill name]" - Fuzzy filter as user types (use fuse.js or simple includes) - Keyboard nav: arrow keys + Enter to navigate - Selecting a skill: navigate to /lmcc-cna-exam-prep/skills/[id]/ - Selecting "Start drill": navigate to skill + set mode to drill in store  ### Mobile - All drag targets: minimum 44×44px - Touch drag: dnd-kit TouchSensor with activationConstraint: { distance: 8 } - Full-width cards on mobile - Segmented control: full width  ### Print stylesheet @media print: - One skill per page (page-break-before: always on each skill card) - Show: step numbers, titles, failRules, critical markers - Hide: checkboxes, coaching notes, navigation, mode toggle, phase rail - Font size: 11pt, no color backgrounds  ---  ## 6. Quality Acceptance Criteria  Motion rules (no exceptions): - All animations: 150–300ms only - Easing: ease-out or gentle spring (stiffness 200–350, damping 20–30) - NEVER bouncy (damping < 15) - prefers-reduced-motion: disable ALL transforms, keep opacity-only fades  Accessibility: - Lighthouse a11y ≥ 95 - All interactive elements keyboard-operable - Drag-and-drop keyboard sensor implemented - focus-visible rings use --core color - aria-live on drill result announcements  Build: - npm run build passes (static export) after EVERY milestone - No TypeScript errors (strict mode) - No unused imports  ---  ## 7. Reference Visual Bar (match this quality, do not copy layouts)  These are the products whose motion restraint, information density, and typography you must match: - **Linear** (linear.app) — overall calm UI feel, motion discipline - **Vercel / Geist** (vercel.com/geist) — tabular numbers, token system, button weight - **Stripe Docs** (docs.stripe.com) — dense reference content with clean hierarchy - **Duolingo** — correct/incorrect feedback affordances, color use for drill results - **Anki** — card flip patterns for Drill 2 - **Arc/Raycast** — ⌘K palette interaction pattern  Do NOT copy their layouts. Match their polish and restraint.  ---  ## 8. Build Order (STOP after each milestone for sign-off)  ### Milestone 1 — Data + Store - [ ] types/skill.ts with full typed interface - [ ] data/skills/*.ts files (hand-hygiene first) - [ ] store/useMasteryStore.ts with hydration guard - [ ] Fix "0 of 19" → "0 of 11" on all 3 pages - [ ] ?instructor=true hides source filenames from student view - [ ] npm run build passes  ### Milestone 2 — Learn Mode Polish (hand-hygiene only, then all 22) - [ ] Phase grouping: OPENING dimmed / CORE emphasized / CLOSING dimmed - [ ] Critical step: --critical-bg + 3px left border - [ ] failRule chip renders under step title - [ ] coachingNote italic with Coach prefix tag - [ ] examNote Authority badge (GWC solid / Credentia outline) - [ ] HH embedded chip in other skills (replaces 11 repeated rows) - [ ] Step row stagger animation (30ms, 180ms ease-out) - [ ] Student Focus panel in --surface-sunken - [ ] npm run build passes  ### Milestone 3 — Sequence Reconstruction Drill - [ ] Segmented Learn / Test Yourself toggle - [ ] Sorted scored-steps-only list - [ ] Fisher-Yates shuffle on init - [ ] dnd-kit sortable with drag handle - [ ] Keyboard sensor + aria-live - [ ] Check Order button with correct/misplaced feedback - [ ] Shake animation on misplaced steps - [ ] Persistent critical border on misplaced critical steps - [ ] Try again reshuffles only wrong steps - [ ] npm run build passes  ### Milestone 4 — Critical-Tolerance + Free-Recall Drills - [ ] Drill 2: failRule cue cards, input/MCQ, card flip - [ ] Drill 3: hide/reveal, got-it/missed-it, redrill tray - [ ] npm run build passes  ### Milestone 5 — Polish Pass - [ ] Phase left-rail map with IntersectionObserver - [ ] ⌘K command palette with fuzzy search - [ ] Dark mode tokens active - [ ] Print stylesheet - [ ] Lighthouse a11y ≥ 95 - [ ] npm run build passes`

---

## Reference Screenshots to Collect (5 min)

Drop these in `/design-refs/` and attach to Cursor as your visual quality bar:


| Product                                      | What to capture                     | Why                              |
| -------------------------------------------- | ----------------------------------- | -------------------------------- |
| [linear.app](https://linear.app/)            | Issue list + command palette        | Overall calm dark UI feel        |
| [vercel.com/geist](https://vercel.com/geist) | Token table + button system         | Number formatting, button weight |
| [docs.stripe.com](https://docs.stripe.com/)  | Any dense reference page            | Clean info hierarchy             |
| Duolingo lesson screen                       | Correct + incorrect feedback states | Drill feedback color language    |
| Anki card flip                               | Front → back transition             | Drill 2 card flip pattern        |
| Raycast or Arc                               | ⌘K palette open state               | Command palette UX               |


Tell Cursor: *"Match the motion restraint, information density, and typography of these references. Do not copy their layouts."*

---

## Two Cursor Session Tips

1. **Start every session with:** *"Read the full build spec in* `/CURSOR-BUILD-SPEC.md` *before any edits. We're on Milestone [n]. Only touch files relevant to this milestone."*
2. **After each milestone:** Run `npm run build`, open localhost, check Hand Hygiene first (it has the most edge cases — critical steps, sub-steps, embedded HH chip, failRule, coachingNote, and examNote all in one skill).

