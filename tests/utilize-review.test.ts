import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getAllSkills } from "@/lib/skills";
import { getTemplatePrefixSteps } from "@/lib/skill-templates";

const masterDbPath = path.join(
  process.cwd(),
  "..",
  "Educator_Mastermind",
  "master_course_database.json",
);
const hasMasterDb = fs.existsSync(masterDbPath);

/**
 * Cross-check invariants from utlize-review.md against live skills.json.
 * Documents accepted vs rejected review recommendations with Headmaster authority.
 */
describe("utlize-review cross-check", () => {
  it.skipIf(!hasMasterDb)(
    "master DB stores explicit segment for peri step 5 and 6 (not code override)",
    () => {
      const db = JSON.parse(fs.readFileSync(masterDbPath, "utf8")) as {
        skills: Array<{
          slug: string;
          checklist_steps: Array<{ number: number; segment?: string }>;
        }>;
      };
      const peri = db.skills.find((s) => s.slug === "perineal-care-female")!;
      expect(peri.checklist_steps.find((s) => s.number === 5)?.segment).toBe(
        "core",
      );
      expect(peri.checklist_steps.find((s) => s.number === 6)?.segment).toBe(
        "core",
      );
    },
  );

  it("P1: peri step 5 side rail is CORE and step 6 gloves is CORE (official order outlier)", () => {
    const peri = getAllSkills().find((s) => s.slug === "perineal-care-female")!;
    expect(peri.steps.find((s) => s.id === 5)?.segment).toBe("core");
    expect(peri.steps.find((s) => s.id === 6)?.segment).toBe("core");
    expect(peri.steps.find((s) => s.id === 6)?.boilerplateId).toBe("GLOVE_DON");
    // OPEN block is contiguous ids 1–4 only; step order is not reordered (Headmaster fidelity)
    const openIds = peri.steps
      .filter((s) => s.segment === "open")
      .map((s) => s.id);
    expect(openIds).toEqual([1, 2, 3, 4]);
  });

  it("P2: bedpan T6 OPEN is 4 steps per Headmaster (gloves at step 5 are CORE)", () => {
    const bedpan = getAllSkills().find((s) => s.slug === "bedpan-assist")!;
    const openSteps = bedpan.steps.filter((s) => s.segment === "open");
    expect(openSteps).toHaveLength(4);
    expect(openSteps.map((s) => s.id)).toEqual([1, 2, 3, 4]);
    expect(bedpan.steps.find((s) => s.id === 5)?.segment).toBe("core");
    expect(getTemplatePrefixSteps("T6")).toHaveLength(4);
  });

  it("P3: FINAL-PASS ambulate and weight use short cues (GWC step parity)", () => {
    const ambulate = getAllSkills().find(
      (s) => s.slug === "ambulate-transfer-belt",
    )!;
    expect(ambulate.steps.find((s) => s.id === 4)?.text).toBe(
      "Place nonskid footwear on patient",
    );
    expect(ambulate.steps.find((s) => s.id === 7)?.text).toBe(
      "Dangle patient on bed edge",
    );

    const weight = getAllSkills().find(
      (s) => s.slug === "weight-ambulatory-client",
    )!;
    const doc = weight.steps.find((s) => s.id === 12)?.text ?? "";
    expect(doc).toMatch(/document/i);
    expect(doc).toMatch(/±2 lb/);
  });

  it("T1+ foot care has contiguous 5-step OPEN including GLOVE_DON", () => {
    const foot = getAllSkills().find((s) => s.slug === "foot-care-one-foot")!;
    const openSteps = foot.steps.filter((s) => s.segment === "open");
    expect(openSteps).toHaveLength(5);
    expect(openSteps.at(-1)?.boilerplateId).toBe("GLOVE_DON");
  });
});
