export const STUDY_STATE_KEY = "cna-study-state";

export type StudyState = {
  masteredIds: number[];
  examDate: string | null;
  studyDays: number;
  /** ISO date of last visit — internal, for studyDays increment */
  lastVisitDate: string | null;
};

export type DerivedStudyState = {
  masteredCount: number;
  examSoon: boolean;
  currentBand: StudyBand;
};

export type StudyBand = "foundation" | "building" | "exam-ready" | "exam-week";

const EMPTY_STATE: StudyState = {
  masteredIds: [],
  examDate: null,
  studyDays: 0,
  lastVisitDate: null,
};

/** SSR-safe initial state — never read localStorage during render. */
export const EMPTY_STUDY_STATE: StudyState = { ...EMPTY_STATE };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseStudyState(raw: unknown): StudyState {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ...EMPTY_STATE };
  }
  const obj = raw as Record<string, unknown>;
  const masteredIds = Array.isArray(obj.masteredIds) ?
    obj.masteredIds.filter((n): n is number => typeof n === "number")
  : [];
  return {
    masteredIds: [...new Set(masteredIds)].sort((a, b) => a - b),
    examDate: typeof obj.examDate === "string" ? obj.examDate : null,
    studyDays: typeof obj.studyDays === "number" ? obj.studyDays : 0,
    lastVisitDate:
      typeof obj.lastVisitDate === "string" ? obj.lastVisitDate : null,
  };
}

export function readStudyState(): StudyState {
  if (typeof window === "undefined") {
    return { ...EMPTY_STATE };
  }
  try {
    const raw = window.localStorage.getItem(STUDY_STATE_KEY);
    if (!raw) {
      return { ...EMPTY_STATE };
    }
    return parseStudyState(JSON.parse(raw));
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function writeStudyState(state: StudyState): void {
  try {
    window.localStorage.setItem(STUDY_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode errors
  }
}

/** Bump studyDays on first open each calendar day; call once on study page mount */
export function touchStudyDay(): StudyState {
  const state = readStudyState();
  const today = todayIso();
  if (state.lastVisitDate === today) {
    return state;
  }
  const next: StudyState = {
    ...state,
    studyDays: state.studyDays + 1,
    lastVisitDate: today,
  };
  writeStudyState(next);
  return next;
}

export function toggleMastered(studyOrder: number): StudyState {
  const state = readStudyState();
  const set = new Set(state.masteredIds);
  if (set.has(studyOrder)) {
    set.delete(studyOrder);
  } else {
    set.add(studyOrder);
  }
  const next: StudyState = {
    ...state,
    masteredIds: [...set].sort((a, b) => a - b),
  };
  writeStudyState(next);
  return next;
}

export function setExamDate(isoDate: string | null): StudyState {
  const state = readStudyState();
  const next = { ...state, examDate: isoDate };
  writeStudyState(next);
  return next;
}

export function isMastered(state: StudyState, studyOrder: number): boolean {
  return state.masteredIds.includes(studyOrder);
}

export function masteredIdSet(state: StudyState): Set<number> {
  return new Set(state.masteredIds);
}

function daysUntilExam(examDate: string | null): number | null {
  if (!examDate) {
    return null;
  }
  const exam = new Date(`${examDate}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function deriveStudyState(
  state: StudyState,
  totalSkills: number,
): DerivedStudyState {
  const masteredCount = state.masteredIds.length;
  const days = daysUntilExam(state.examDate);
  const examSoon = days !== null && days >= 0 && days <= 7;

  let currentBand: StudyBand = "foundation";
  const ratio = totalSkills > 0 ? masteredCount / totalSkills : 0;
  if (examSoon) {
    currentBand = "exam-week";
  } else if (ratio >= 0.85) {
    currentBand = "exam-ready";
  } else if (ratio >= 0.4) {
    currentBand = "building";
  }

  return { masteredCount, examSoon, currentBand };
}

export const STUDY_STATE_UPDATED_EVENT = "study-state-updated";

export function notifyStudyStateUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STUDY_STATE_UPDATED_EVENT));
  }
}
