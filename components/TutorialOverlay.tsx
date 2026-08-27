"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import RepeatExampleCards from "@/components/RepeatExampleCards";
import { TUTORIAL_SLIDES } from "@/lib/tutorial-copy";
import { markTutorialSeen, readTutorialState } from "@/lib/tutorial-store";

type TutorialOverlayProps = {
  onClose?: () => void;
  onOpenPattern?: () => void;
};

export default function TutorialOverlay({
  onClose,
  onOpenPattern,
}: TutorialOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [seen, setSeen] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    setSeen(readTutorialState().seen);
  }, []);

  const visible = !seen;

  function dismiss() {
    markTutorialSeen();
    setSeen(true);
    onClose?.();
  }

  function next() {
    if (slide >= TUTORIAL_SLIDES.length - 1) {
      onOpenPattern?.();
      dismiss();
      return;
    }
    setSlide((current) => current + 1);
  }

  const current = TUTORIAL_SLIDES[slide];

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="tutorial-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-overlay-title"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
        >
          <motion.div
            className="tutorial-overlay__panel"
            initial={reduceMotion ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <p className="tutorial-overlay__kicker">{current.kicker}</p>
            <h2 id="tutorial-overlay-title" className="tutorial-overlay__title">
              {current.title}
            </h2>
            <p className="tutorial-overlay__body">{current.body}</p>
            {"studyMethodHref" in current && current.studyMethodHref ? (
              <p>
                <Link
                  href={current.studyMethodHref}
                  className="tutorial-overlay__link"
                >
                  Read the full study method →
                </Link>
              </p>
            ) : null}
            {current.id === "examples" ? (
              <RepeatExampleCards onBeforeNavigate={dismiss} />
            ) : null}
            <div className="tutorial-overlay__nav">
              <button
                type="button"
                className="tutorial-overlay__skip"
                onClick={dismiss}
              >
                Skip
              </button>
              <p className="tutorial-overlay__progress">
                {slide + 1} / {TUTORIAL_SLIDES.length}
              </p>
              <button
                type="button"
                className="tutorial-overlay__next"
                onClick={next}
              >
                {slide === TUTORIAL_SLIDES.length - 1 ? "Got it" : "Next"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
