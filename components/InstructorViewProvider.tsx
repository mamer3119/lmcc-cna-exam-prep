"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  getInstructorViewServerSnapshot,
  getInstructorViewSnapshot,
  instructorViewServerSnapshot,
  subscribeInstructorView,
  type InstructorViewSnapshot,
} from "@/lib/instructor-view-store";

export type InstructorViewState = InstructorViewSnapshot;

export const defaultInstructorViewState: InstructorViewState =
  instructorViewServerSnapshot;

const InstructorViewContext = createContext<InstructorViewState>(
  defaultInstructorViewState,
);

/**

 * Client-only instructor flag — never calls useSearchParams (avoids SSG/SSR bailout).

 * useSyncExternalStore + deferred emit avoids "useInsertionEffect must not schedule updates"

 * when history.pushState runs during style injection / dev overlay commits.

 */

export function InstructorViewProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribeInstructorView,

    getInstructorViewSnapshot,

    getInstructorViewServerSnapshot,
  );

  return (
    <InstructorViewContext.Provider value={state}>
      {children}
    </InstructorViewContext.Provider>
  );
}

/** SSR / Suspense fallback — student-safe defaults until client mount. */

export function InstructorViewProviderFallback({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <InstructorViewContext.Provider value={defaultInstructorViewState}>
      {children}
    </InstructorViewContext.Provider>
  );
}

export function useInstructorViewContext(): InstructorViewState {
  return useContext(InstructorViewContext);
}
