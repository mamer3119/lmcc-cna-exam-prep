import { notFound } from "next/navigation";

import SkillPageView from "@/components/SkillPageView";
import { getAllSkills, getSkillBySlug } from "@/lib/skills";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSkills().map((skill) => ({ slug: skill.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return { title: "Skill not found" };
  return {
    title: `${skill.title} — CNA Checklist`,
    description: `${skill.examCardLabel}. ${skill.stepCount} official checklist steps.`,
  };
}

export default async function SkillPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  const prev = skill.prevSlug ? getSkillBySlug(skill.prevSlug) : undefined;
  const next = skill.nextSlug ? getSkillBySlug(skill.nextSlug) : undefined;

  return (
    <main>
      <SkillPageView skill={skill} prev={prev} next={next} />
    </main>
  );
}
