import RepeatExampleCards from "@/components/RepeatExampleCards";
import {
  FEATURED_HAND_HYGIENE_EXAMPLES,
  getHandHygieneReuse,
  getHandHygieneReuseSummary,
} from "@/lib/repeat-graph";

const FEATURED_STEP_KEYS = new Set(
  FEATURED_HAND_HYGIENE_EXAMPLES.flatMap((example) =>
    example.stepIds.map((stepId) => `${example.slug}:${stepId}`),
  ),
);

export default function HandHygieneReuseMap() {
  const summary = getHandHygieneReuseSummary();
  const rest = getHandHygieneReuse().filter(
    (row) => !FEATURED_STEP_KEYS.has(`${row.skillSlug}:${row.stepId}`),
  );

  const grouped = new Map<string, typeof rest>();
  for (const row of rest) {
    const list = grouped.get(row.skillSlug) ?? [];
    list.push(row);
    grouped.set(row.skillSlug, list);
  }

  return (
    <section className="hh-reuse-map" aria-labelledby="hh-reuse-heading">
      <h2 id="hh-reuse-heading" className="hh-reuse-map__title">
        Skill 1 reuse map
      </h2>
      <p className="hh-reuse-map__lede">
        Skill 1 shows up in {summary.skillCount} other skills (
        {summary.stepCount} checklist steps). Here are the first two rooms —
        PPE and Radial Pulse — then the rest.
      </p>
      <RepeatExampleCards />
      <details className="hh-reuse-map__more">
        <summary>Show the other {grouped.size} skills</summary>
        <ul className="hh-reuse-map__rest">
          {[...grouped.values()].map((rows) => (
            <li key={rows[0].skillSlug}>
              <strong>{rows[0].skillTitle}</strong>
              <span>
                {rows
                  .map((row) => `step ${row.stepId} (${row.stepText})`)
                  .join("; ")}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
