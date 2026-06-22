"use client";

import { useCallback, useMemo, useState } from "react";

import type { ChecklistStep } from "@/lib/checklist-step";
import {
  filterRecallCards,
  toRecallCards,
  type RecallCard,
} from "@/lib/free-recall-drill";
import { useMasteryStore } from "@/store/useMasteryStore";

type FreeRecallDrillProps = {
  steps: ChecklistStep[];
  skillSlug: string;
  title: string;
};

type RecallOutcome = "pending" | "got-it" | "missed";

export function FreeRecallDrill({
  steps,
  skillSlug,
  title,
}: FreeRecallDrillProps) {
  const markDrilled = useMasteryStore((s) => s.markDrilled);
  const allCards = useMemo(
    () => toRecallCards(steps, skillSlug),
    [steps, skillSlug],
  );

  const [deck, setDeck] = useState<RecallCard[]>(() => allCards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<string, RecallOutcome>>({});
  const [redrillOnly, setRedrillOnly] = useState(false);
  const [liveMsg, setLiveMsg] = useState<string | null>(null);

  const card = deck[index];
  const missedIds = useMemo(
    () =>
      new Set(
        Object.entries(outcomes)
          .filter(([, v]) => v === "missed")
          .map(([id]) => id),
      ),
    [outcomes],
  );
  const missedCount = missedIds.size;
  const complete = index >= deck.length;

  const recordOutcome = useCallback(
    (outcome: "got-it" | "missed") => {
      if (!card) {
        return;
      }
      setOutcomes((prev) => ({ ...prev, [card.id]: outcome }));
      if (outcome === "got-it") {
        markDrilled(skillSlug, card.id);
        setLiveMsg(`Step ${card.stepId}: marked got it.`);
      } else {
        setLiveMsg(
          `Step ${card.stepId}: marked missed — added to redrill tray.`,
        );
      }
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [card, markDrilled, skillSlug],
  );

  const startRedrill = useCallback(() => {
    const subset = filterRecallCards(allCards, missedIds);
    if (subset.length === 0) {
      return;
    }
    setDeck(subset);
    setIndex(0);
    setRevealed(false);
    setRedrillOnly(true);
    setLiveMsg(
      `Redrilling ${subset.length} missed step${subset.length === 1 ? "" : "s"}.`,
    );
  }, [allCards, missedIds]);

  const resetDeck = useCallback(() => {
    setDeck(allCards);
    setIndex(0);
    setRevealed(false);
    setOutcomes({});
    setRedrillOnly(false);
    setLiveMsg(null);
  }, [allCards]);

  return (
    <section className="recall-drill" aria-labelledby="recall-drill-title">
      <h2 id="recall-drill-title" className="sequence-drill-title">
        Free recall — {title}
      </h2>
      <p className="sequence-drill-lead">
        {complete ?
          "Review your missed steps below."
        : `Card ${index + 1} of ${deck.length} — recall the official wording.`}
      </p>

      {!complete && card ?
        <article className="recall-card">
          <p className="recall-card__cue">{card.cue}</p>
          {revealed ?
            <p className="recall-card__answer">{card.answer}</p>
          : <button
              type="button"
              className="recall-card__reveal"
              onClick={() => setRevealed(true)}
            >
              Reveal
            </button>
          }
          {revealed ?
            <div className="recall-card__actions">
              <button
                type="button"
                className="recall-card__btn recall-card__btn--got"
                onClick={() => recordOutcome("got-it")}
              >
                Got it ✓
              </button>
              <button
                type="button"
                className="recall-card__btn recall-card__btn--missed"
                onClick={() => recordOutcome("missed")}
              >
                Missed it ✗
              </button>
            </div>
          : null}
        </article>
      : null}

      {complete ?
        <div className="recall-drill__summary">
          {missedCount === 0 ?
            <p className="sequence-drill-result" role="status">
              No missed steps — you recalled every scored step.
            </p>
          : <>
              <p className="sequence-drill-result" role="status">
                {missedCount} step{missedCount === 1 ? "" : "s"} to redrill.
              </p>
              <ul className="recall-drill__missed-list">
                {filterRecallCards(allCards, missedIds).map((m) => (
                  <li key={m.id}>
                    <span className="tnum">Step {m.stepId}.</span> {m.answer}
                  </li>
                ))}
              </ul>
            </>
          }
          <div className="sequence-drill-actions">
            {missedCount > 0 ?
              <button
                type="button"
                className="sequence-drill-btn"
                onClick={startRedrill}
              >
                Drill missed steps
              </button>
            : null}
            <button
              type="button"
              className="sequence-drill-btn sequence-drill-btn--secondary"
              onClick={resetDeck}
            >
              {redrillOnly ? "Back to full deck" : "Start over"}
            </button>
          </div>
        </div>
      : null}

      <div className="sequence-drill-live sr-only" aria-live="polite">
        {liveMsg}
      </div>

      {missedCount > 0 && !complete ?
        <aside
          className="recall-drill-tray print:hidden"
          aria-label="Missed steps"
        >
          <span className="recall-drill-tray__label">
            Redrill these ({missedCount})
          </span>
        </aside>
      : null}
    </section>
  );
}
