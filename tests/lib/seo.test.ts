import { describe, expect, it } from "vitest";
import {
  graduatesMetadata,
  homeMetadata,
  jsonLdItemList,
  jsonLdLearningResource,
  jsonLdOrganization,
  jsonLdWebPage,
  jsonLdWebSite,
  SITE_ORIGIN,
  skillMetadata,
  skillsListMetadata,
} from "@/lib/seo";
import { getAllSkills } from "@/lib/skills";
import { canonicalPath } from "@/lib/paths";

describe("lib/seo", () => {
  it("home metadata has title and description", () => {
    const meta = homeMetadata();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it("skills list metadata has title and description", () => {
    const meta = skillsListMetadata();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it("skill metadata uses the skill title and exam card label", () => {
    const skill = getAllSkills()[0];
    const meta = skillMetadata(skill);
    expect(meta.title).toContain(skill.title);
    expect(meta.description).toContain(skill.examCardLabel);
  });

  it("graduates metadata has title and description", () => {
    const meta = graduatesMetadata();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it("jsonLdWebSite returns a valid WebSite object", () => {
    const json = jsonLdWebSite();
    expect(json["@type"]).toBe("WebSite");
    expect(json.name).toBeTruthy();
    expect(json.url).toMatch(/^https:\/\//);
  });

  it("jsonLdOrganization returns a valid Organization object", () => {
    const json = jsonLdOrganization();
    expect(json["@type"]).toBe("Organization");
    expect(json.name).toBe("Lotus Medical Career College");
  });

  it("jsonLdItemList returns a list of items", () => {
    const items = [
      { name: "Hand Hygiene", url: "https://example.com/skills/hand-hygiene/" },
      { name: "PPE", url: "https://example.com/skills/ppe/" },
    ];
    const json = jsonLdItemList(items);
    expect(json["@type"]).toBe("ItemList");
    expect(Array.isArray(json.itemListElement)).toBe(true);
    expect(json.itemListElement).toHaveLength(2);
  });

  it("jsonLdLearningResource returns a valid LearningResource", () => {
    const skill = getAllSkills()[0];
    const json = jsonLdLearningResource(skill);
    expect(json["@type"]).toBe("LearningResource");
    expect(json.name).toBe(skill.title);
    expect(json.educationalUse).toBe("California CNA state exam preparation");
  });

  it("jsonLdWebPage returns a valid WebPage", () => {
    const json = jsonLdWebPage("Test Page", "Test description", "/test/");
    expect(json["@type"]).toBe("WebPage");
    expect(json.name).toBe("Test Page");
    expect(json.url).toMatch(/^https:\/\//);
  });

  it("home metadata canonical URL includes the basePath", () => {
    const meta = homeMetadata();
    const expected = `${SITE_ORIGIN}${canonicalPath("/")}`;
    expect(meta.alternates?.canonical).toBe(expected);
  });
});
