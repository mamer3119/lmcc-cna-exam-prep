import Link from "next/link";

import { getFeaturedHandHygieneExamples } from "@/lib/repeat-graph";
import { appPath } from "@/lib/paths";

type RepeatExampleCardsProps = {
  onBeforeNavigate?: () => void;
};

export default function RepeatExampleCards({
  onBeforeNavigate,
}: RepeatExampleCardsProps) {
  const cards = getFeaturedHandHygieneExamples().filter(
    (card) => card.occurrences.length > 0,
  );

  return (
    <ul className="hh-example-cards" aria-label="Where Skill 1 repeats">
      {cards.map((card) => (
        <li key={card.slug} className="hh-example-card">
          <p className="hh-example-card__meta">
            Skill {card.examSkillNumber}
          </p>
          <h3 className="hh-example-card__title">{card.title}</h3>
          <ul className="hh-example-card__steps">
            {card.occurrences.map((row) => (
              <li key={`${row.skillSlug}-${row.stepId}`}>
                <span className="hh-example-card__step-id">
                  Step {row.stepId}
                  {row.segment ? ` · ${row.segment}` : ""}
                </span>
                <q>{row.stepText}</q>
              </li>
            ))}
          </ul>
          <Link
            href={appPath(`skills/${card.slug}/`)}
            className="hh-example-card__link"
            onClick={onBeforeNavigate}
          >
            Open {card.title} →
          </Link>
        </li>
      ))}
    </ul>
  );
}
