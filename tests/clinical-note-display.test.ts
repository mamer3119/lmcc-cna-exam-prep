import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import { resolveStepClinicalNote } from "@/lib/skill-step-meta";
import {
  buildInstructorSourceChip,
  getInstructorNote,
  getStudentNote,
  resolveClinicalNotePresentation,
  sanitizeClinicalNoteForStudent,
} from "@/lib/clinical-note-display";

const TRANSCRIPT_ID = /\bS\d{2}\b/;

describe("clinical-note-display (instructor source gate)", () => {
  const callLightSample =
    'Exam rule: GWC states call signal must always be within reach when leaving REGIONAL-TESTING-CENTER.pdf. Order confirmed by transcripts: CALL_LIGHT → BED_LOW → HAND_HYGIENE (S03, S05) ALL-TRANSCRIPTS-S01-S22.md. Say: "Here\'s your call light."';

  it("strips PDF, transcript IDs, and attribution clauses for student view", () => {
    const student = getStudentNote(callLightSample);
    expect(student).not.toMatch(/REGIONAL-TESTING-CENTER\.pdf/i);
    expect(student).not.toMatch(/ALL-TRANSCRIPTS-S01-S22\.md/i);
    expect(student).not.toMatch(TRANSCRIPT_ID);
    expect(student).not.toMatch(/order confirmed by transcripts/i);
    expect(student).toMatch(/call signal must always be within reach/i);
    expect(student).toMatch(/Here's your call light/i);
  });

  it("student and instructor presentations differ when provenance exists", () => {
    const student = getStudentNote(callLightSample);
    const instructor = getInstructorNote(callLightSample);
    expect(student).toBeTruthy();
    expect(instructor?.sourceChip).toBeTruthy();
    expect(instructor?.sourceChip).toMatch(TRANSCRIPT_ID);
    expect(`${student}${instructor?.sourceChip ?? ""}`).not.toBe(student);
  });

  it("instructor mode uses sanitized body plus SourceChip payload, not raw inline citations", () => {
    const michelleNote =
      "Verbalize: \"At this time I would wash my hands.\" Michelle's exact phrase in S07, S11, S12 ALL-TRANSCRIPTS-S01-S22.md. Washing before documenting satisfies GWC's before-recording requirement.";

    const presentation = resolveClinicalNotePresentation(michelleNote, true);
    expect(presentation?.body).not.toMatch(TRANSCRIPT_ID);
    expect(presentation?.body).not.toMatch(/Michelle's exact phrase/i);
    expect(presentation?.body).toMatch(/Washing before documenting/i);
    expect(presentation?.sourceChip).toMatch(/Michelle's exact phrase/i);
    expect(presentation?.sourceChip).toMatch(/S07/);
  });

  it("Hand Hygiene step 1 — student note has no transcript IDs", () => {
    const skill = getSkillBySlug("hand-hygiene");
    const step1 = skill?.steps.find((s) => s.id === 1);
    expect(step1).toBeDefined();

    const raw = resolveStepClinicalNote(step1!);
    expect(raw).toMatch(TRANSCRIPT_ID);

    const student = getStudentNote(raw);
    expect(student).toBeTruthy();
    expect(student).not.toMatch(TRANSCRIPT_ID);
    expect(student).toMatch(/wrong identity = real harm/i);
    expect(student).toMatch(/May I check your ID band/i);
  });

  it("PPE step 16 — student note has no transcript IDs or Michelle attribution", () => {
    const skill = getSkillBySlug("ppe-gown-gloves");
    const step16 = skill?.steps.find((s) => s.id === 16);
    expect(step16).toBeDefined();

    const raw = resolveStepClinicalNote(step16!);
    expect(raw).toMatch(TRANSCRIPT_ID);

    const student = getStudentNote(raw);
    expect(student).toBeTruthy();
    expect(student).not.toMatch(TRANSCRIPT_ID);
    expect(student).not.toMatch(/Michelle's exact phrase/i);
    expect(student).toMatch(/wash my hands/i);
  });

  it("buildInstructorSourceChip aggregates IDs, filenames, and attribution", () => {
    const chip = buildInstructorSourceChip(callLightSample);
    expect(chip).toMatch(/S03/);
    expect(chip).toMatch(/REGIONAL-TESTING-CENTER\.pdf/i);
    expect(chip).toMatch(/order confirmed by transcripts/i);
  });

  it("PPE step 16 — no orphaned md./pdf. in student or instructor body", () => {
    const skill = getSkillBySlug("ppe-gown-gloves");
    const step16 = skill?.steps.find((s) => s.id === 16);
    const raw = resolveStepClinicalNote(step16!);
    const student = getStudentNote(raw);
    const instructor = getInstructorNote(raw);

    expect(student).not.toMatch(/\b(md|pdf)\b\./i);
    expect(instructor?.body).not.toMatch(/\b(md|pdf)\b\./i);
    expect(student).toMatch(/wash my hands/i);
    expect(student).toMatch(/Washing before documenting/i);
  });

  it("SkillChecklist delegates clinical notes to StepClinicalNote", () => {
    const src = readFileSync(
      path.join(process.cwd(), "components/SkillChecklist.tsx"),
      "utf8",
    );
    expect(src).toMatch(/<StepClinicalNote/);
    expect(src).toMatch(/instructorViewActive/);
    expect(src).toMatch(/useInstructorViewContext/);
  });

  it("every boilerplate clinicalNote sanitizes without transcript IDs", () => {
    const bundle = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "data/boilerplate-tags.json"),
        "utf8",
      ),
    ) as {
      tagsByBoilerplateId: Record<string, { clinicalNote: string | null }[]>;
    };

    for (const variants of Object.values(bundle.tagsByBoilerplateId)) {
      for (const variant of variants) {
        const raw = variant.clinicalNote?.trim();
        if (!raw) {
          continue;
        }
        const student = getStudentNote(raw);
        expect(student, `leaked in: ${raw.slice(0, 80)}…`).not.toMatch(
          TRANSCRIPT_ID,
        );
        expect(student).not.toMatch(/Michelle's exact phrase/i);
      }
    }
  });
});

describe("sanitizeClinicalNoteForStudent cleanup", () => {
  it("does not leave dangling comma artifacts after stripping IDs from parens", () => {
    const raw =
      "When: Skills where the wrong identity = real harm (feeding S10, catheter S17, bed bath S11). How: greet.";
    const cleaned = sanitizeClinicalNoteForStudent(raw);
    expect(cleaned).not.toMatch(TRANSCRIPT_ID);
    expect(cleaned).not.toMatch(/,\s*,/);
    expect(cleaned).not.toMatch(/\(\s*,/);
    expect(cleaned).toMatch(/\(feeding, catheter, bed bath\)/i);
  });
});
