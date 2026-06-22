/**
 * Flat export payload for LMCC CNA skills → Excel (.xlsm builder).
 * All enrichment fields read via lib/skill-step-meta (skills.json + boilerplate-tags.json).
 */
import skillsBundle from "@/data/skills.json";
import { getModuleForSlug, skillCurriculumMeta } from "@/data/skillCurriculum";
import { resolveStepDisplayText } from "@/lib/checklist-step";
import {
  resolveStepClinicalNote,
  resolveStepCriticalCategory,
  resolveStepDetailedText,
  resolveStepExamScorecardRaw,
  resolveStepPhaseWord,
  resolveStepSubSteps,
  resolveStepTagCategory,
} from "@/lib/skill-step-meta";
import type { SkillsBundle, WebSkill } from "@/lib/skills";

const SEGMENT_SHORT_LABELS = {
  open: "OPEN",
  core: "CORE",
  close: "CLOSE",
} as const;

export type XlsmStepPayload = {
  id: number;
  text: string;
  rawText: string;
  segment: string;
  segmentLabel: string;
  boilerplateId: string;
  detailedTagText: string;
  tagCategoryLabel: string;
  phaseWord: string;
  note: string;
  subSteps: string[];
  criticalCategory: string;
  examScorecard: string;
};

export type XlsmSkillPayload = {
  slug: string;
  studyOrder: number;
  examSkillNumber: number;
  examCardLabel: string;
  title: string;
  section: string;
  moduleVerb: string;
  template: string;
  templateTier: number;
  stepCount: number;
  studentFocus: string | null;
  steps: XlsmStepPayload[];
};

export type XlsmExportPayload = {
  generatedAt: string;
  source: string;
  pathwayTagline: string;
  segmentOrder: string[];
  segmentLabels: typeof SEGMENT_SHORT_LABELS;
  skills: XlsmSkillPayload[];
};

function mapSkillToPayload(skill: WebSkill): XlsmSkillPayload {
  const meta = skillCurriculumMeta[skill.slug];
  const module = getModuleForSlug(skill.slug);
  const steps = skill.steps.map((step) => {
    const displayText = resolveStepDisplayText(step, { slug: skill.slug });
    const tagCategory = resolveStepTagCategory(step) ?? "";
    return {
      id: step.id,
      text: displayText,
      rawText: step.text,
      segment: step.segment ?? "core",
      segmentLabel: SEGMENT_SHORT_LABELS[step.segment ?? "core"],
      boilerplateId: step.boilerplateId ?? "",
      detailedTagText: resolveStepDetailedText(step) ?? "",
      tagCategoryLabel: tagCategory,
      phaseWord: meta ? resolveStepPhaseWord(step, meta) : "",
      note: resolveStepClinicalNote(step) ?? "",
      subSteps: resolveStepSubSteps(step) ?? [],
      criticalCategory: resolveStepCriticalCategory(step, displayText) ?? "",
      examScorecard: resolveStepExamScorecardRaw(step) ?? "",
    };
  });

  return {
    slug: skill.slug,
    studyOrder: skill.studyOrder,
    examSkillNumber: skill.examSkillNumber,
    examCardLabel: skill.examCardLabel,
    title: skill.title,
    section: skill.section,
    moduleVerb: module?.verb ?? "",
    template: meta?.template ?? "",
    templateTier: meta?.tier ?? 0,
    stepCount: skill.stepCount,
    studentFocus: skill.studentFocus ?? null,
    steps,
  };
}

/** Build export payload from committed skills.json (sorted by studyOrder). */
export function buildSkillsXlsmPayload(
  skills: WebSkill[] = [...(skillsBundle as SkillsBundle).skills].sort(
    (a, b) => a.studyOrder - b.studyOrder,
  ),
): XlsmExportPayload {
  return {
    generatedAt: new Date().toISOString(),
    source:
      "local-checklist-preview/data/skills.json + data/boilerplate-tags.json",
    pathwayTagline: (skillsBundle as SkillsBundle).pathwayTagline,
    segmentOrder: ["open", "core", "close"],
    segmentLabels: SEGMENT_SHORT_LABELS,
    skills: skills.map(mapSkillToPayload),
  };
}
