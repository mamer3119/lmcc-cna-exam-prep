import Link from "next/link";

import GlobalDisclaimer from "@/components/GlobalDisclaimer";
import JsonLd from "@/components/JsonLd";
import { jsonLdWebPage, studyMethodMetadata } from "@/lib/seo";

export const metadata = studyMethodMetadata();

export default function StudyMethodPage() {
  const title = "How to study the 22 CNA skills";
  const description =
    "A simple memory-palace study method: the sandwich, FLAME, and confusion pairs.";

  return (
    <>
      <JsonLd data={jsonLdWebPage(title, description, "/study-method/")} />
      <main className="site-shell memory-palace">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>How to study</span>
        </nav>

        <header className="mb-8">
          <p className="lmcc-cover-eyebrow">Study method</p>
          <h1 className="lmcc-cover-title">How to study the 22 CNA skills</h1>
          <p className="text-sm text-[var(--muted)] md:text-base">
            Use the same pattern on every skill so your brain stops memorizing 22
            random lists and starts recognizing a repeatable routine.
          </p>
        </header>

        <section
          className="grid gap-6 md:grid-cols-3"
          aria-label="Study method cards"
        >
          <article className="mp-card">
            <span className="mp-card__badge mp-card__badge--open">
              Step 1 — The Sandwich
            </span>
            <h2 className="mp-card__title">Same open, same close</h2>
            <p className="mp-card__body">
              Most skills start the same way (introduce, privacy, hand hygiene)
              and end the same way (call light, bed low, hand hygiene). The
              middle is the only part that changes.
            </p>
            <ul className="mp-card__list">
              <li>
                <strong>OPEN</strong> — automatic first steps
              </li>
              <li>
                <strong>CORE</strong> — the skill you are being tested on
              </li>
              <li>
                <strong>CLOSE</strong> — where most points are lost
              </li>
            </ul>
          </article>

          <article className="mp-card">
            <span className="mp-card__badge mp-card__badge--core">
              Step 2 — FLAME
            </span>
            <h2 className="mp-card__title">Self-check every skill</h2>
            <p className="mp-card__body">
              Run through FLAME before you say "I am done." It catches the
              ending mistakes that cost the most points.
            </p>
            <ul className="mp-card__list">
              <li>
                <strong>F</strong> — First steps right
              </li>
              <li>
                <strong>L</strong> — Loop infection control
              </li>
              <li>
                <strong>A</strong> — Action: the procedure middle
              </li>
              <li>
                <strong>M</strong> — Must-safety checks
              </li>
              <li>
                <strong>E</strong> — End: call light, bed low, final hand wash
              </li>
            </ul>
          </article>

          <article className="mp-card">
            <span className="mp-card__badge mp-card__badge--close">
              Step 3 — Confusion Pairs
            </span>
            <h2 className="mp-card__title">Compare similar skills</h2>
            <p className="mp-card__body">
              Some skills feel alike because they share the same opening. Practice
              them back-to-back and name the one thing that changes in the middle.
            </p>
            <ul className="mp-card__list">
              <li>Catheter / Foot / Peri-care — basin open, different middle</li>
              <li>Radial pulse / Respirations — both 60-second counts</li>
              <li>Bed-to-wheelchair / Ambulate — both use a transfer belt</li>
            </ul>
          </article>
        </section>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/skills/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-accent)]"
          >
            Browse all 22 skills
          </Link>
          <Link
            href="/skills/hand-hygiene/"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--rule)] px-5 py-3 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--panel)]"
          >
            Start with Hand Hygiene
          </Link>
        </div>

        <GlobalDisclaimer />
      </main>
    </>
  );
}
