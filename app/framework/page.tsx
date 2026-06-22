import Link from "next/link";

import { SitePrimaryNav } from "@/components/SitePrimaryNav";
import { getPathwayTagline } from "@/lib/skills";

export const metadata = {
  title: "Clinical Field Guide — OPEN · CORE · CLOSE",
  description:
    "How LMCC structures every CNA skill: opening safety, core procedure, closing documentation.",
};

const FRAMEWORK_PHASES = [
  {
    key: "open",
    label: "OPEN",
    color: "#3B82F6",
    headline: "Approach safely",
    body: "Introduce yourself, identify the patient, provide privacy, and perform hand hygiene before touching the environment or the person.",
    examNote:
      "Evaluators watch identity and infection control before any procedure begins.",
  },
  {
    key: "core",
    label: "CORE",
    color: "#F59E0B",
    headline: "Perform the skill",
    body: "The scored middle — technique, tolerances, sequence, and critical steps your evaluator marks on the checklist.",
    examNote:
      "Memorize the middle. This is what drills and Test Yourself target.",
  },
  {
    key: "close",
    label: "CLOSE",
    color: "#10B981",
    headline: "Restore and document",
    body: "Hand hygiene, call light in reach, bed low and locked, privacy restored, and accurate reporting.",
    examNote:
      "Students lose points here when they rush out after the “main” procedure.",
  },
] as const;

export default function FrameworkPage() {
  const pathwayTagline = getPathwayTagline();

  return (
    <main>
      <div className="site-shell framework-page">
        <SitePrimaryNav />

        <header className="framework-hero">
          <p className="lmcc-cover-eyebrow">LMCC Clinical Field Guide</p>
          <h1 className="framework-hero__title">
            Every skill has a spine — not a scroll
          </h1>
          <p className="framework-hero__lead">
            California CNA checklists follow a three-phase rhythm:{" "}
            <strong>OPEN</strong> · <strong>CORE</strong> ·{" "}
            <strong>CLOSE</strong>. You already did the work in lab; tonight is
            review, not cram.
          </p>
          <p className="framework-hero__pathway">{pathwayTagline}</p>
        </header>

        <section
          className="framework-phases"
          aria-labelledby="framework-phases-heading"
        >
          <h2 id="framework-phases-heading" className="framework-section-title">
            The three phases
          </h2>
          <div className="framework-phases__grid">
            {FRAMEWORK_PHASES.map((phase, index) => (
              <article
                key={phase.key}
                className="framework-phase-card"
                style={
                  { "--phase-accent": phase.color } as Record<string, string>
                }
              >
                <span className="framework-phase-card__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="framework-phase-card__label">{phase.label}</h3>
                <p className="framework-phase-card__headline">
                  {phase.headline}
                </p>
                <p className="framework-phase-card__body">{phase.body}</p>
                <p className="framework-phase-card__exam">{phase.examNote}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="framework-flow"
          aria-labelledby="framework-flow-heading"
        >
          <h2 id="framework-flow-heading" className="framework-section-title">
            How to study with this app
          </h2>
          <ol className="framework-flow__steps">
            <li>
              <Link href="/framework/pathway/">Pick your section</Link> on the
              22-skill pathway map.
            </li>
            <li>
              Open a skill → <strong>Learn</strong> with{" "}
              <strong>All steps</strong> to read OPEN · CORE · CLOSE in order.
            </li>
            <li>
              Toggle <strong>Core only</strong> to hide bookends and focus the
              scored middle.
            </li>
            <li>
              Switch to <strong>Test Yourself</strong> → Sequence, Tolerance,
              then Recall.
            </li>
          </ol>
        </section>

        <footer className="framework-cta">
          <Link href="/framework/pathway/" className="framework-cta__primary">
            Open 22-skill pathway →
          </Link>
          <Link href="/" className="framework-cta__secondary">
            Browse all skills
          </Link>
        </footer>
      </div>
    </main>
  );
}
