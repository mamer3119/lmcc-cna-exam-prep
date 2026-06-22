import { SKILL_PROGRESS_KEY } from "@/lib/exam-meta";

export type SkillProgressStatus = "not-started" | "in-progress" | "reviewed";

export type SkillProgressMap = Record<string, SkillProgressStatus>;

export function parseSkillProgress(raw: unknown): SkillProgressMap {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {};
  }
  const map: SkillProgressMap = {};
  for (const [key, value] of Object.entries(raw)) {
    if (
      value === "not-started" ||
      value === "in-progress" ||
      value === "reviewed"
    ) {
      map[key] = value;
    }
  }
  return map;
}

export function readSkillProgress(): SkillProgressMap {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(SKILL_PROGRESS_KEY);
    if (!raw) {
      return {};
    }
    return parseSkillProgress(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function writeSkillProgress(map: SkillProgressMap): void {
  try {
    window.localStorage.setItem(SKILL_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota / private-mode errors
  }
}

export function getSkillProgressStatus(
  map: SkillProgressMap,
  skillId: string,
): SkillProgressStatus {
  return map[skillId] ?? "not-started";
}

export function countReviewedSkills(
  map: SkillProgressMap,
  totalSkills: number,
): number {
  const reviewed = Object.values(map).filter((s) => s === "reviewed").length;
  return Math.min(reviewed, totalSkills);
}

export function markSkillReviewed(
  map: SkillProgressMap,
  skillId: string,
): SkillProgressMap {
  return { ...map, [skillId]: "reviewed" };
}

export function markSkillInProgress(
  map: SkillProgressMap,
  skillId: string,
): SkillProgressMap {
  if (map[skillId] === "reviewed") {
    return map;
  }
  return { ...map, [skillId]: "in-progress" };
}

export function resetAllSkillProgress(): void {
  try {
    window.localStorage.removeItem(SKILL_PROGRESS_KEY);
  } catch {
    // Ignore private-mode errors
  }
}

export const SKILL_PROGRESS_UPDATED_EVENT = "skill-progress-updated";

export function progressStatusLabel(status: SkillProgressStatus): string {
  switch (status) {
    case "reviewed":
      return "Reviewed";
    case "in-progress":
      return "In progress";
    default:
      return "Not started";
  }
}
