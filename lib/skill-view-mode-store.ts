"use client";

import type { SkillViewMode } from "@/lib/practice-labels";

export type SkillViewModeSnapshot = {
  mode: SkillViewMode;
};

export const skillViewModeServerSnapshot: SkillViewModeSnapshot = {
  mode: "full-view",
};

type Listener = () => void;

const listeners = new Set<Listener>();
let mounted = false;
let historyPatched = false;
let restoreHistory: (() => void) | null = null;

/** In-memory mode — persists across skill rail navigation; not localStorage. */
let currentMode: SkillViewMode = "full-view";

let cachedSnapshot: SkillViewModeSnapshot = skillViewModeServerSnapshot;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function scheduleEmit(): void {
  queueMicrotask(emit);
}

function syncUrlFilter(mode: SkillViewMode): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (mode === "core-only") {
    url.searchParams.set("filter", "core");
  } else {
    url.searchParams.delete("filter");
  }
  window.history.replaceState(null, "", url.toString());
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

function readModeFromUrl(): SkillViewMode | null {
  if (typeof window === "undefined") {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("filter") === "core") {
    return "core-only";
  }
  return null;
}

function recomputeSnapshot(): SkillViewModeSnapshot {
  const next: SkillViewModeSnapshot = {
    mode: currentMode,
  };
  if (
    cachedSnapshot.mode !== next.mode
  ) {
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

export function getSkillViewModeSnapshot(): SkillViewModeSnapshot {
  return recomputeSnapshot();
}

export function setSkillViewMode(mode: SkillViewMode): void {
  if (currentMode === mode) {
    return;
  }
  currentMode = mode;
  syncUrlFilter(mode);
  scheduleEmit();
}

export function subscribeSkillViewMode(listener: Listener): () => void {
  listeners.add(listener);
  if (!mounted) {
    mounted = true;
    const fromUrl = readModeFromUrl();
    if (fromUrl) {
      currentMode = fromUrl;
    }
    if (!historyPatched) {
      historyPatched = true;
      restoreHistory = patchHistory(scheduleEmit);
    }
    scheduleEmit();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && mounted) {
      mounted = false;
      restoreHistory?.();
      restoreHistory = null;
      historyPatched = false;
    }
  };
}

/** Core filter applies only in full-view / core-only — never in self-check drills. */
export function skillViewModeUsesCoreFilter(mode: SkillViewMode): boolean {
  return mode === "core-only";
}
