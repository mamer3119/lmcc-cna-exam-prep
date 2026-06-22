import { describe, expect, it } from "vitest";

import pedagogicalOrder from "@/data/pedagogical-order.json";
import {
  getAllSkills,
  getSections,
  getPathwayTagline,
  getSkillBySlug,
} from "@/lib/skills";

describe("pedagogical ordering", () => {
  it("loads pathway tagline from bundle", () => {
    expect(getPathwayTagline()).toMatch(/protect/i);
  });

  it("orders 7 sections per Reasoned Ordering doc", () => {
    const sections = getSections();
    expect(sections).toHaveLength(7);
    expect(sections.map((s) => s.section)).toEqual([
      "Infection Control",
      "Measurement and Recording",
      "Mobility and Positioning",
      "Restorative and Support",
      "Personal Care",
      "Feeding and Nutrition",
      "Elimination and Peri Care",
    ]);
  });

  it("places radial pulse before respirations (study 3 then 4)", () => {
    const pulse = getSkillBySlug("radial-pulse-60-seconds");
    const resp = getSkillBySlug("respirations-60-seconds");
    expect(pulse?.studyOrder).toBe(3);
    expect(resp?.studyOrder).toBe(4);
    expect(pulse?.nextSlug).toBe("respirations-60-seconds");
  });

  it("chains prev/next by study order globally", () => {
    const skills = getAllSkills();
    for (let i = 0; i < skills.length; i += 1) {
      expect(skills[i].studyOrder).toBe(i + 1);
      if (i > 0) {
        expect(skills[i].prevSlug).toBe(skills[i - 1].slug);
      }
      if (i < skills.length - 1) {
        expect(skills[i].nextSlug).toBe(skills[i + 1].slug);
      }
    }
  });

  it("ends with catheter care as study 22", () => {
    const last = getAllSkills().at(-1);
    expect(last?.slug).toBe("catheter-care-female");
    expect(last?.section).toBe("Elimination and Peri Care");
  });

  it("pedagogical-order.json matches synced bundle slugs", () => {
    const bundleSlugs = new Set(getAllSkills().map((s) => s.slug));
    const orderSlugs = pedagogicalOrder.skills.map((s) => s.slug);
    expect(orderSlugs).toHaveLength(22);
    for (const slug of orderSlugs) {
      expect(bundleSlugs.has(slug)).toBe(true);
    }
  });

  it("every skill has pedagogicalReason text", () => {
    for (const skill of getAllSkills()) {
      expect(skill.pedagogicalReason.length).toBeGreaterThan(20);
    }
  });

  it("uses official RTC display titles from pedagogical order", () => {
    expect(getSkillBySlug("hand-hygiene")?.title).toBe(
      "Hand Hygiene (Hand Washing)",
    );
    expect(getSkillBySlug("position-on-side")?.title).toBe("Positions on Side");
    expect(getSkillBySlug("modified-bed-bath")?.title).toBe(
      "Gives Modified Bed Bath (Face and One Arm, Hand and Underarm)",
    );
    expect(getSkillBySlug("catheter-care-female")?.title).toBe(
      "Provides Catheter Care for Female",
    );
  });
});
