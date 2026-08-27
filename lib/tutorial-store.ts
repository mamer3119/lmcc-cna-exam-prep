export const TUTORIAL_KEY = "lmcc-cna-tutorial-v1";

export type TutorialState = {
  seen: boolean;
  completedAt?: number;
};

export function readTutorialState(): TutorialState {
  if (typeof window === "undefined") {
    return { seen: false };
  }
  try {
    const raw = window.localStorage.getItem(TUTORIAL_KEY);
    if (!raw) {
      return { seen: false };
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("seen" in parsed) ||
      typeof (parsed as { seen: unknown }).seen !== "boolean"
    ) {
      return { seen: false };
    }
    const completedAt = (parsed as { completedAt?: unknown }).completedAt;
    return {
      seen: (parsed as { seen: boolean }).seen,
      ...(typeof completedAt === "number" ? { completedAt } : {}),
    };
  } catch {
    return { seen: false };
  }
}

export function markTutorialSeen(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      TUTORIAL_KEY,
      JSON.stringify({ seen: true, completedAt: Date.now() }),
    );
  } catch {
    // Ignore quota / private-mode errors
  }
}

export function resetTutorial(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(TUTORIAL_KEY);
  } catch {
    // Ignore
  }
}
