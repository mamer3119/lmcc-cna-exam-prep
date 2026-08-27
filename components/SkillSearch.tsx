"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAllSkills } from "@/lib/skills";

export default function SkillSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return getAllSkills().filter((skill) =>
      skill.title.toLowerCase().includes(trimmed),
    );
  }, [query]);

  return (
    <section className="skill-search" aria-label="Search skills">
      <label htmlFor="skill-search" className="skill-search__label">
        Or jump to a skill
      </label>
      <input
        id="skill-search"
        type="search"
        className="skill-search__input"
        placeholder="e.g., Hand Hygiene"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {results.length > 0 && (
        <ul className="skill-search__results" aria-live="polite">
          {results.map((skill) => (
            <li key={skill.slug}>
              <Link href={`/skills/${skill.slug}/`}>{skill.title}</Link>
            </li>
          ))}
        </ul>
      )}
      {query.trim() && results.length === 0 && (
        <p className="skill-search__empty">No skills match your search.</p>
      )}
    </section>
  );
}
