export const GLOBAL_DISCLAIMER =
  "This is a free study and directory resource. It is not a California Department of Public Health (CDPH) or Regional Testing Center website. Always verify your program code, exam date, and registration requirements with your school and the official testing portal.";

export function schoolDetailDisclaimer(lastUpdated: string): string {
  return `Data source: Golden West College Regional Testing Center candidate registration portal. School codes and names change; verify directly with your program and the official portal before registering. Last updated: ${lastUpdated}.`;
}

export const SKILL_DISCLAIMER =
  "Step wording reflects the official California CNA evaluator checklist used by LMCC students. Always follow the instructions given by your evaluator on exam day. Clinical notes are study aids, not a substitute for your training program.";

export const LMCC_STUDENT_NOTE =
  "LMCC students: this study order is recommended by Lotus Medical Career College faculty. Non-LMCC visitors can use the same free resources, but follow your own program’s requirements first.";
