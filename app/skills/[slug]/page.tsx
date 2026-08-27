import { notFound } from "next/navigation";
import Link from "next/link";
import GlobalDisclaimer from "@/components/GlobalDisclaimer";
import JsonLd from "@/components/JsonLd";
import PracticeTools from "@/components/PracticeTools";
import SimplifiedSkillChecklist from "@/components/SimplifiedSkillChecklist";
import SkillVideoEmbed from "@/components/SkillVideoEmbed";
import { SKILL_DISCLAIMER } from "@/lib/compliance";
import { getAllSkills, getSkillBySlug } from "@/lib/skills";
import { jsonLdLearningResource, skillMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSkills().map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return { title: "Skill not found" };
  return skillMetadata(skill);
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  const prev = skill.prevSlug ? getSkillBySlug(skill.prevSlug) : undefined;
  const next = skill.nextSlug ? getSkillBySlug(skill.nextSlug) : undefined;

  return (
    <>
      <JsonLd data={jsonLdLearningResource(skill)} />
      <main className="site-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/skills/">Skills</Link>
          <span aria-hidden="true"> / </span>
          <span>{skill.title}</span>
        </nav>

        <header className="skill-header">
          <h1 className="skill-header__title">{skill.title}</h1>
          <p className="skill-header__exam">{skill.examCardLabel}</p>
          <p className="skill-header__context">
            {skill.stepCount} official checklist steps. Check each step as you practice.
          </p>
        </header>

        <SimplifiedSkillChecklist skill={skill} />
        <PracticeTools skill={skill} />
        {skill.rtcVideoUrl && (
          <SkillVideoEmbed
            videoUrl={skill.rtcVideoUrl}
            title={skill.rtcVideoTitle}
          />
        )}

        <div className="skill-nav-bottom">
          {prev ? (
            <Link href={`/skills/${prev.slug}/`}>← {prev.title}</Link>
          ) : (
            <span />
          )}
          {next ? <Link href={`/skills/${next.slug}/`}>{next.title} →</Link> : null}
        </div>

        <p className="skill-disclaimer">{SKILL_DISCLAIMER}</p>

        <GlobalDisclaimer />
      </main>
    </>
  );
}
