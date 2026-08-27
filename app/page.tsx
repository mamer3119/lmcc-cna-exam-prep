import Link from "next/link";

import GlobalDisclaimer from "@/components/GlobalDisclaimer";
import JsonLd from "@/components/JsonLd";
import PathwayCards from "@/components/PathwayCards";
import SkillSearch from "@/components/SkillSearch";
import { homeMetadata, jsonLdOrganization, jsonLdWebSite } from "@/lib/seo";

export const metadata = homeMetadata();

export default function HomePage() {
  return (
    <>
      <JsonLd data={[jsonLdWebSite(), jsonLdOrganization()]} />
      <main className="site-shell home-page">
        <header className="home-page__hero">
          <p className="lmcc-cover-eyebrow">LMCC CNA exam prep</p>
          <h1 className="lmcc-cover-title">
            Pass the CNA state exam by practicing the 22 official skills.
          </h1>
          <p className="home-page__subtitle">
            Built for Lotus Medical Career College students. No signup. Works on your phone.
          </p>
          <p className="mb-8 text-center text-sm">
            <Link
              href="/study-method/"
              className="font-semibold text-[var(--primary-accent)] hover:underline"
            >
              New? Read the study method first →
            </Link>
          </p>
        </header>

        <PathwayCards />
        <SkillSearch />
        <GlobalDisclaimer />
      </main>
    </>
  );
}
