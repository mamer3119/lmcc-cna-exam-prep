"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

import type { ChecklistStep } from "@/lib/checklist-step";
import {
  checkToleranceAnswer,
  toToleranceCards,
  type ToleranceCard,
} from "@/lib/tolerance-drill";
import { useMasteryStore } from "@/store/useMasteryStore";

type ToleranceDrillProps = {
  steps: ChecklistStep[];
  skillSlug: string;
  title: string;
};

type CardState = "idle" | "correct" | "wrong";

function ToleranceCardView({
  card,
  state,
  flipped,
  onSelect,
  reduceMotion,
}: {
  card: ToleranceCard;
  state: CardState;
  flipped: boolean;
  onSelect: (option: string) => void;
  reduceMotion: boolean | null;
}) {
  const flipTransition = reduceMotion ? { duration: 0.2 } : { duration: 0.3 };

  return (
    <div
      className={`tolerance-card tolerance-card--${state} ${flipped ? "tolerance-card--flipped" : ""}`}
    >
      <motion.div
        className="tolerance-card__inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={flipTransition}
        style={{ transformStyle: reduceMotion ? "flat" : "preserve-3d" }}
      >
        <div className="tolerance-card__front">
          <p className="tolerance-card__step tnum">Step {card.stepId}</p>
          <h3 className="tolerance-card__prompt">{card.prompt}</h3>
          <ul className="tolerance-card__options">
            {card.options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  className="tolerance-card__option"
                  onClick={() => onSelect(option)}
                  disabled={flipped}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="tolerance-card__back" aria-hidden={!flipped}>
          <p className="tolerance-card__result">
            {state === "correct" ? "Correct" : "Correct answer"}
          </p>
          <p className="tolerance-card__official">{card.officialText}</p>
          {state === "wrong" && card.whyItFails ?
            <p className="tolerance-card__why">{card.whyItFails}</p>
          : null}
        </div>
      </motion.div>
    </div>
  );
}

export function ToleranceDrill({
  steps,
  skillSlug,
  title,
}: ToleranceDrillProps) {
  const cards = useMemo(
    () => toToleranceCards(steps, skillSlug),
    [steps, skillSlug],
  );
  const markDrilled = useMasteryStore((s) => s.markDrilled);
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [state, setState] = useState<CardState>("idle");
  const [flipped, setFlipped] = useState(false);
  const [liveMsg, setLiveMsg] = useState<string | null>(null);

  const card = cards[index];

  const handleSelect = useCallback(
    (option: string) => {
      if (!card || flipped) {
        return;
      }
      const correct = checkToleranceAnswer(card, option);
      setState(correct ? "correct" : "wrong");
      setFlipped(true);
      if (correct) {
        markDrilled(skillSlug, card.id);
        setLiveMsg(`Step ${card.stepId}: correct.`);
      } else {
        setLiveMsg(
          `Step ${card.stepId}: incorrect. Correct answer: ${card.correctAnswer}.`,
        );
      }
    },
    [card, flipped, markDrilled, skillSlug],
  );

  const handleNext = useCallback(() => {
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
      setState("idle");
      setFlipped(false);
      setLiveMsg(null);
    }
  }, [cards.length, index]);

  if (cards.length === 0) {
    return (
      <section className="tolerance-drill tolerance-drill--empty">
        <h2 className="sequence-drill-title">Tolerance drill — {title}</h2>
        <p className="sequence-drill-lead">
          No timed or tolerance steps on this skill. Try Sequence or Recall.
        </p>
      </section>
    );
  }

  return (
    <section
      className="tolerance-drill"
      aria-labelledby="tolerance-drill-title"
    >
      <h2 id="tolerance-drill-title" className="sequence-drill-title">
        Tolerance drill — {title}
      </h2>
      <p className="sequence-drill-lead">
        Card {index + 1} of {cards.length} — pick the exam-standard answer.
      </p>

      {card ?
        <ToleranceCardView
          card={card}
          state={state}
          flipped={flipped}
          onSelect={handleSelect}
          reduceMotion={reduceMotion}
        />
      : null}

      <div className="sequence-drill-live sr-only" aria-live="polite">
        {liveMsg}
      </div>

      {flipped ?
        <div className="sequence-drill-actions">
          {index < cards.length - 1 ?
            <button
              type="button"
              className="sequence-drill-btn"
              onClick={handleNext}
            >
              Next card
            </button>
          : <p className="sequence-drill-result" role="status">
              All tolerance cards complete.
            </p>
          }
        </div>
      : null}
    </section>
  );
}
