/** Filenames cited in instructor notes — never inline in student view. */
const FILENAME_PATTERN = /\b[\w-]+\.(pdf|md|txt|json)\b/gi;

/** Orphan extension tokens left when a filename strip stops at the first dot (e.g. ALL-TRANSCRIPTS… → md.). */
const ORPHAN_EXTENSION_PATTERN = /\s*\b(pdf|md|txt|json)\.\s*/gi;

/** RTC transcript skill IDs (S01–S22) — instructor provenance only. */
const TRANSCRIPT_ID_PATTERN = /\bS\d{2}\b/g;

/** Whole-clause instructor attributions — must consume through filename extension. */
const ATTRIBUTION_EXTRACT_PATTERNS: RegExp[] = [
  /Michelle's exact phrase in[\s\S]*?[\w-]+\.md\.?\s*/gi,
  /order confirmed by transcripts[\s\S]*?[\w-]+\.md\.?\s*/gi,
  /transcripts confirm[\s\S]*?[\w-]+\.md\.?\s*/gi,
];

/** Extra fallbacks when filename pattern differs (strip only). */
const ATTRIBUTION_STRIP_FALLBACKS: RegExp[] = [
  /Michelle's exact phrase[^.]*\.?\s*/gi,
  /order confirmed by transcripts[^.]*\.?\s*/gi,
  /transcripts confirm[^.]*\.?\s*/gi,
];

const ATTRIBUTION_STRIP_PATTERNS: RegExp[] = [
  ...ATTRIBUTION_EXTRACT_PATTERNS,
  ...ATTRIBUTION_STRIP_FALLBACKS,
];

export type ClinicalNotePresentation = {
  /** Student-safe body — always sanitized (both student and instructor modes). */
  body: string;
  /** Gray chip content — instructor mode only, when provenance exists. */
  sourceChip?: string;
};

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

function extractTranscriptIds(note: string): string[] {
  return uniqueNonEmpty([...note.matchAll(/\b(S\d{2})\b/gi)].map((m) => m[1]!));
}

function extractFilenames(note: string): string[] {
  return uniqueNonEmpty([...note.matchAll(FILENAME_PATTERN)].map((m) => m[0]!));
}

function extractAttributionClauses(note: string): string[] {
  const clauses: string[] = [];
  for (const pattern of ATTRIBUTION_EXTRACT_PATTERNS) {
    for (const match of note.matchAll(pattern)) {
      clauses.push(match[0].trim());
    }
  }
  return uniqueNonEmpty(clauses);
}

function noteWithoutFilenames(note: string): string {
  return note.replace(FILENAME_PATTERN, " ");
}

/** Build instructor-only chip text from raw note — always from pre-sanitized source. */
export function buildInstructorSourceChip(note: string): string | undefined {
  const parts = uniqueNonEmpty([
    ...extractAttributionClauses(note),
    ...extractTranscriptIds(noteWithoutFilenames(note)),
    ...extractFilenames(note),
  ]);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function removeOrphanExtensionTokens(text: string): string {
  return text.replace(ORPHAN_EXTENSION_PATTERN, " ");
}

/** Collapse dangling commas, empty parens, and duplicate whitespace after stripping. */
export function cleanupStudentNoteBody(text: string): string {
  let s = text;

  for (const pattern of ATTRIBUTION_STRIP_PATTERNS) {
    s = s.replace(pattern, "");
  }
  s = s.replace(FILENAME_PATTERN, " ");
  s = removeOrphanExtensionTokens(s);
  s = s.replace(TRANSCRIPT_ID_PATTERN, "");

  s = s.replace(/\(\s*([^)]*)\)/g, (_match, inner: string) => {
    const cleaned = inner
      .replace(/\s*,\s*,+/g, ", ")
      .replace(/^\s*,\s*|\s*,\s*$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    return cleaned ? `(${cleaned})` : "";
  });

  s = s.replace(/\s*,\s*,+/g, ", ");
  s = s.replace(/\(\s*\)/g, "");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/\.\s*\./g, ".");
  s = s.replace(/\s+\./g, ".");
  s = s.replace(/\.\s+(?=[A-Z"])/g, ". ");
  s = s.replace(/,\s*\./g, ".");
  s = s.replace(/\s+,/g, ",");
  s = s.trim();

  return s;
}

/** Student-facing note body — no transcript IDs, filenames, or instructor attributions. */
export function sanitizeClinicalNoteForStudent(note: string): string {
  return cleanupStudentNoteBody(note.trim());
}

export function getStudentNote(note: string | undefined): string | undefined {
  const trimmed = note?.trim();
  if (!trimmed) {
    return undefined;
  }
  const body = sanitizeClinicalNoteForStudent(trimmed);
  return body.length > 0 ? body : undefined;
}

/** Full instructor presentation: sanitized body + separate source chip. */
export function getInstructorNote(
  note: string | undefined,
): ClinicalNotePresentation | undefined {
  return resolveClinicalNotePresentation(note, true);
}

export function resolveClinicalNotePresentation(
  note: string | undefined,
  instructorView: boolean,
): ClinicalNotePresentation | undefined {
  const trimmed = note?.trim();
  if (!trimmed) {
    return undefined;
  }

  const sourceChip = buildInstructorSourceChip(trimmed);
  const body = getStudentNote(trimmed);

  if (!body && !sourceChip) {
    return undefined;
  }

  return {
    body: body ?? "",
    sourceChip: instructorView && sourceChip ? sourceChip : undefined,
  };
}

/** @deprecated Use resolveClinicalNotePresentation — returns student-safe body only. */
export function formatClinicalNoteForView(
  note: string | undefined,
  _instructorView: boolean,
): string | undefined {
  return getStudentNote(note);
}

/** @deprecated Use buildInstructorSourceChip */
export function extractInstructorSource(note: string): string | undefined {
  return buildInstructorSourceChip(note);
}

const ORPHAN_EXT_IN_BODY = /\b(md|pdf|txt|json)\b\./i;

/** Regression guard — student/instructor bodies must not contain orphaned extensions. */
export function noteBodyHasOrphanExtension(body: string | undefined): boolean {
  return Boolean(body && ORPHAN_EXT_IN_BODY.test(body));
}
