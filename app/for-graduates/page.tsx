import Link from "next/link";
import GlobalDisclaimer from "@/components/GlobalDisclaimer";
import JsonLd from "@/components/JsonLd";
import { LMCC_STUDENT_NOTE } from "@/lib/compliance";
import { graduatesMetadata, jsonLdWebPage } from "@/lib/seo";

export const metadata = graduatesMetadata();

export default function ForGraduatesPage() {
  const title = "LMCC CNA Graduate Study Guide | Navigator";
  const description =
    "Continue practicing the 22 official California CNA skills after graduation.";

  return (
    <>
      <JsonLd data={jsonLdWebPage(title, description, "/for-graduates/")} />
      <main className="site-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>For graduates</span>
        </nav>

        <header className="for-graduates__header">
          <h1 className="lmcc-cover-title">Keep practicing after graduation</h1>
          <p className="for-graduates__intro">
            LMCC graduates can keep using the same 22 official CNA skills
            checklist to prepare for the California state exam.
          </p>
        </header>

        <section className="for-graduates__paths" aria-label="Get started">
          <article className="for-graduates__path">
            <h2>Start with a skill</h2>
            <p>Begin with Hand Hygiene — every other skill depends on it.</p>
            <Link href="/skills/hand-hygiene/">Open Hand Hygiene →</Link>
          </article>

          <article className="for-graduates__path">
            <h2>Browse all 22 skills</h2>
            <p>
              See the full list of California CNA skills and pick one to review.
            </p>
            <Link href="/skills/">View all skills →</Link>
          </article>
        </section>

        <p className="for-graduates__lmcc-note">{LMCC_STUDENT_NOTE}</p>

        <GlobalDisclaimer />
      </main>
    </>
  );
}
