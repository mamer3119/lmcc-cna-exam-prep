import {
  HAND_HYGIENE_SLUG,
  LAST_EXAM_SIMULATION_KEY,
  MEASUREMENT_SKILL_SLUGS,
} from "@/lib/exam-meta";

export type ExamSimulation = {
  slugs: string[];
  generatedAt: string;
};

export type RandomSource = () => number;

function pickRandom<T>(items: readonly T[], random: RandomSource): T {
  const index = Math.floor(random() * items.length);
  return items[index]!;
}

function pickRandomMany<T>(
  items: readonly T[],
  count: number,
  random: RandomSource,
): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]!);
  }
  return picked;
}

/** Build a 5-skill exam draw: Hand Hygiene + 1 measurement + 3 random others. */
export function generateExamSimulation(
  allSlugs: readonly string[],
  random: RandomSource = Math.random,
): ExamSimulation {
  const measurementSlug = pickRandom(MEASUREMENT_SKILL_SLUGS, random);
  const measurementSet = new Set<string>(MEASUREMENT_SKILL_SLUGS);
  const remainingPool = allSlugs.filter(
    (slug) => slug !== HAND_HYGIENE_SLUG && !measurementSet.has(slug),
  );
  const randomThree = pickRandomMany(remainingPool, 3, random);

  return {
    slugs: [HAND_HYGIENE_SLUG, measurementSlug, ...randomThree],
    generatedAt: new Date().toISOString(),
  };
}

export function reshuffleExamSimulation(
  current: ExamSimulation,
  allSlugs: readonly string[],
  random: RandomSource = Math.random,
): ExamSimulation {
  void current;
  return generateExamSimulation(allSlugs, random);
}

export function parseExamSimulation(raw: unknown): ExamSimulation | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }
  const slugs = (raw as { slugs?: unknown }).slugs;
  const generatedAt = (raw as { generatedAt?: unknown }).generatedAt;
  if (
    !Array.isArray(slugs) ||
    slugs.length !== 5 ||
    !slugs.every((s) => typeof s === "string") ||
    typeof generatedAt !== "string"
  ) {
    return null;
  }
  if (!slugs.includes(HAND_HYGIENE_SLUG)) {
    return null;
  }
  return { slugs: slugs as string[], generatedAt };
}

export function readStoredExamSimulation(): ExamSimulation | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LAST_EXAM_SIMULATION_KEY);
    if (!raw) {
      return null;
    }
    return parseExamSimulation(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStoredExamSimulation(simulation: ExamSimulation): void {
  try {
    window.localStorage.setItem(
      LAST_EXAM_SIMULATION_KEY,
      JSON.stringify(simulation),
    );
  } catch {
    // Ignore quota / private-mode errors
  }
}
