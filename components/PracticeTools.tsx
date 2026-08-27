import Link from "next/link";
import type { WebSkill } from "@/lib/skills";

type PracticeToolsProps = {
  skill?: WebSkill;
};

export default function PracticeTools({ skill }: PracticeToolsProps) {
  return (
    <details className="practice-tools">
      <summary className="practice-tools__summary">Practice tools</summary>
      <div className="practice-tools__panel">
        <p className="practice-tools__hint">
          Use these only after you can already complete the checklist in order.
        </p>
        <ul className="practice-tools__links">
          <li>
            <Link href="/study/">Full study mode with sequence drills</Link>
          </li>
          {skill && (
            <li>
              <Link href={`/skills/${skill.slug}/`}>Back to this checklist</Link>
            </li>
          )}
        </ul>
      </div>
    </details>
  );
}
