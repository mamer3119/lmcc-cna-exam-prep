"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { curriculumModules, skillCurriculumMeta } from "@/data/skillCurriculum";
import {
  EMPTY_STUDY_STATE,
  STUDY_STATE_UPDATED_EVENT,
  deriveStudyState,
  isMastered,
  masteredIdSet,
  notifyStudyStateUpdated,
  readStudyState,
  setExamDate,
  touchStudyDay,
  toggleMastered,
  type StudyState,
} from "@/lib/study-state";
import type { WebSkill } from "@/lib/skills";

type StudyStateContextValue = {
  studyState: StudyState;
  derived: ReturnType<typeof deriveStudyState>;
  masteredSet: Set<number>;
  masteredByModule: Record<number, { done: number; total: number }>;
  toggleMasteredForOrder: (studyOrder: number) => void;
  setExamDateValue: (value: string) => void;
};

const StudyStateContext = createContext<StudyStateContextValue | null>(null);

type StudyStateProviderProps = {
  skills: WebSkill[];
  children: ReactNode;
};

export function StudyStateProvider({
  skills,
  children,
}: StudyStateProviderProps) {
  const [studyState, setStudyState] = useState(EMPTY_STUDY_STATE);

  useEffect(() => {
    setStudyState(touchStudyDay());
    const refresh = () => setStudyState(readStudyState());
    window.addEventListener(STUDY_STATE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(STUDY_STATE_UPDATED_EVENT, refresh);
  }, []);

  const derived = useMemo(
    () => deriveStudyState(studyState, skills.length),
    [studyState, skills.length],
  );

  const masteredSet = useMemo(() => masteredIdSet(studyState), [studyState]);

  const masteredByModule = useMemo(() => {
    const map: Record<number, { done: number; total: number }> = {};
    for (const mod of curriculumModules) {
      let done = 0;
      for (const slug of mod.skillSlugs) {
        const meta = skillCurriculumMeta[slug];
        if (meta && masteredSet.has(meta.studyOrder)) {
          done += 1;
        }
      }
      map[mod.order] = { done, total: mod.skillSlugs.length };
    }
    return map;
  }, [masteredSet]);

  const toggleMasteredForOrder = useCallback((studyOrder: number) => {
    setStudyState(toggleMastered(studyOrder));
    notifyStudyStateUpdated();
  }, []);

  const setExamDateValue = useCallback((value: string) => {
    setStudyState(setExamDate(value || null));
    notifyStudyStateUpdated();
  }, []);

  const value = useMemo(
    (): StudyStateContextValue => ({
      studyState,
      derived,
      masteredSet,
      masteredByModule,
      toggleMasteredForOrder,
      setExamDateValue,
    }),
    [
      studyState,
      derived,
      masteredSet,
      masteredByModule,
      toggleMasteredForOrder,
      setExamDateValue,
    ],
  );

  return (
    <StudyStateContext.Provider value={value}>
      {children}
    </StudyStateContext.Provider>
  );
}

export function useStudyStateContext(): StudyStateContextValue {
  const ctx = useContext(StudyStateContext);
  if (!ctx) {
    throw new Error(
      "useStudyStateContext must be used within StudyStateProvider",
    );
  }
  return ctx;
}

export { isMastered };
