import Link from "next/link";

import { appPath } from "@/lib/paths";

export default function SeeSkillOneLink() {
  return (
    <p className="skill-hh-see">
      <Link href={appPath("skills/hand-hygiene/")} className="skill-hh-see__link">
        This is Skill 1 — Hand Hygiene →
      </Link>
    </p>
  );
}
