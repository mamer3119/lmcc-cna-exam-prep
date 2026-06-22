"use client";

import { readInstructorViewFromWindow } from "@/lib/instructor-view";

export type InstructorViewSnapshot = {
  instructorView: boolean;
  ready: boolean;
};

export const instructorViewServerSnapshot: InstructorViewSnapshot = {
  instructorView: false,
  ready: false,
};

type Listener = () => void;

const listeners = new Set<Listener>();
let mounted = false;
let historyPatched = false;
let restoreHistory: (() => void) | null = null;

/** Stable reference when values unchanged — required by useSyncExternalStore. */
let cachedSnapshot: InstructorViewSnapshot = instructorViewServerSnapshot;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Defer store notifications — never schedule React updates during insertion effects. */
function scheduleEmit(): void {
  queueMicrotask(emit);
}

function patchHistory(notify: () => void): () => void {
  const pushState = history.pushState.bind(history);
  const replaceState = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<typeof pushState>) => {
    pushState(...args);
    notify();
  };
  history.replaceState = (...args: Parameters<typeof replaceState>) => {
    replaceState(...args);
    notify();
  };

  return () => {
    history.pushState = pushState;
    history.replaceState = replaceState;
  };
}

function recomputeSnapshot(): InstructorViewSnapshot {
  if (!mounted || typeof window === "undefined") {
    if (cachedSnapshot !== instructorViewServerSnapshot) {
      cachedSnapshot = instructorViewServerSnapshot;
    }
    return cachedSnapshot;
  }

  const instructorView = readInstructorViewFromWindow();
  if (
    cachedSnapshot.ready &&
    cachedSnapshot.instructorView === instructorView
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = { instructorView, ready: true };
  return cachedSnapshot;
}

function ensureClientSubscription(): void {
  if (typeof window === "undefined" || historyPatched) {
    return;
  }

  historyPatched = true;
  mounted = true;

  window.addEventListener("popstate", scheduleEmit);
  restoreHistory = patchHistory(scheduleEmit);
  recomputeSnapshot();
  scheduleEmit();
}

function teardownClientSubscription(): void {
  if (!historyPatched || typeof window === "undefined") {
    return;
  }

  window.removeEventListener("popstate", scheduleEmit);
  restoreHistory?.();
  restoreHistory = null;
  historyPatched = false;
  mounted = false;
  cachedSnapshot = instructorViewServerSnapshot;
}

export function subscribeInstructorView(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  ensureClientSubscription();

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      teardownClientSubscription();
    }
  };
}

export function getInstructorViewSnapshot(): InstructorViewSnapshot {
  return recomputeSnapshot();
}

export function getInstructorViewServerSnapshot(): InstructorViewSnapshot {
  return instructorViewServerSnapshot;
}

/** Test-only reset */
export function resetInstructorViewStoreForTests(): void {
  teardownClientSubscription();
  listeners.clear();
  cachedSnapshot = instructorViewServerSnapshot;
}
