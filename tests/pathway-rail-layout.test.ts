import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pathway rail desktop layout (Lighthouse-friendly)", () => {
  it("uses fixed rem rail width and flex nav fill — no vw/clamp on rail", () => {
    const framework = readFileSync("app/framework.css", "utf8");
    const moduleCss = readFileSync(
      "components/SkillPathwayRail.module.css",
      "utf8",
    );

    expect(framework).toMatch(/--skill-rail-width:\s*17\.5rem/);
    expect(moduleCss).not.toMatch(/width:\s*clamp\(/);
    expect(moduleCss).toMatch(/\.desktopRail \.railNav[\s\S]*flex:\s*1 1 0/);
    expect(moduleCss).toMatch(
      /\.desktopRail \.railCount[\s\S]*flex-shrink:\s*0/,
    );
  });

  it("shows all skills without an inner scroll region", () => {
    const moduleCss = readFileSync(
      "components/SkillPathwayRail.module.css",
      "utf8",
    );
    expect(moduleCss).not.toMatch(/overflow-y:\s*auto/);
    expect(moduleCss).not.toMatch(/scrollbar-gutter/);
    expect(moduleCss).toMatch(
      /\.desktopRail \.railNav[\s\S]*justify-content:\s*space-between/,
    );
    expect(moduleCss).toMatch(
      /\.desktopRail :global\(\.skill-pathway-rail__group\)[\s\S]*flex:\s*1 1 0/,
    );
  });

  it("SkillPathwayRail stays a server component (no client scroll hook)", () => {
    const source = readFileSync("components/SkillPathwayRail.tsx", "utf8");
    expect(source).not.toMatch(/"use client"/);
    expect(source).not.toMatch(/scrollIntoView/);
    expect(source).not.toMatch(/useEffect/);
  });

  it("mobile trigger meets 44px touch target minimum", () => {
    const framework = readFileSync("app/framework.css", "utf8");
    expect(framework).toMatch(
      /\.skill-pathway-rail-mobile__trigger[\s\S]*min-height:\s*44px/,
    );
  });
});
