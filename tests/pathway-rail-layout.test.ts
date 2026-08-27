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

  it("keeps KEY and HH× as type labels, not a second letter system", () => {
    const source = readFileSync("components/SkillPathwayRail.tsx", "utf8");
    expect(source).toContain("KEY");
    expect(source).toContain("HH×{hhCount}");
    expect(source).toContain('skill.slug === "hand-hygiene"');
  });

  it("mobile trigger is type, not a leftover link strip", () => {
    const source = readFileSync(
      "components/SkillPathwayRailMobile.tsx",
      "utf8",
    );
    const framework = readFileSync("app/framework.css", "utf8");
    expect(source).toContain("skill-pathway-rail-mobile__kicker");
    expect(source).toContain("Browse rooms →");
    expect(framework).toMatch(
      /\.skill-pathway-rail-mobile__action[\s\S]*color:\s*var\(--cx-accent/,
    );
  });

  it("does not subtract desktop rail width from mobile site-shell", () => {
    const framework = readFileSync("app/framework.css", "utf8");
    const firstShell = framework.slice(
      framework.indexOf(".skill-page-layout .site-shell {"),
      framework.indexOf(
        "@media (min-width: 768px)",
        framework.indexOf(".skill-page-layout .site-shell {"),
      ),
    );
    expect(firstShell).not.toMatch(/100vw\s*-\s*var\(--skill-rail-width/);
  });

  it("pattern toggle stays type — no filled ink chip", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const toggle = css.slice(css.indexOf(".mp-toggle {"));
    expect(toggle).toMatch(
      /\.mp-toggle__btn--active[\s\S]*background:\s*transparent/,
    );
    expect(toggle).not.toMatch(
      /\.mp-toggle__btn--active[\s\S]*background:\s*var\(--cx-ink/,
    );
  });

  it("does not keep the leftover teal / slate rail paint", () => {
    const paint =
      readFileSync("app/framework.css", "utf8") +
      readFileSync("components/SkillPathwayRail.module.css", "utf8");
    expect(paint).not.toMatch(
      /#0f766e|#0f3d38|#ccfbf1|#134e4a|#f0fdfa|#f1f5f9|#e8edf4/i,
    );
  });
});
