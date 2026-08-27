"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

type ChecklistRevealProps = {
  replayKey: string;
  children: ReactNode;
};

function isVitest(): boolean {
  return typeof process !== "undefined" && process.env.VITEST === "true";
}

export default function ChecklistReveal({
  replayKey,
  children,
}: ChecklistRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const items = root.querySelectorAll<HTMLElement>("[data-journal-reveal]");
      if (items.length === 0) return;

      if (isVitest()) {
        gsap.set(items, { autoAlpha: 1, y: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motionOk: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = Boolean(context.conditions?.reduceMotion);
          if (reduceMotion) {
            gsap.set(items, { autoAlpha: 1, y: 0 });
            return;
          }

          gsap.from(items, {
            autoAlpha: 0,
            y: 10,
            duration: 0.38,
            stagger: { each: 0.045, from: "start" },
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          });
        },
      );

      return () => {
        mm.revert();
      };
    },
    { scope, dependencies: [replayKey], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className="journal-reveal">
      {children}
    </div>
  );
}
