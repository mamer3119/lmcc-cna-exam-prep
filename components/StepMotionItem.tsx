"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type StepMotionItemProps = {
  index: number;
  enabled: boolean;
  children: ReactNode;
  className?: string;
  dataAttributes?: Record<string, string>;
};

/**
 * Stagger animation gated behind client mount — SSR and first paint render a
 * plain <li> so motion initial props never diverge from the server HTML.
 */
export function StepMotionItem({
  index,
  enabled,
  children,
  className,
  dataAttributes,
}: StepMotionItemProps) {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!enabled || !mounted) {
    return (
      <li className={className} {...dataAttributes}>
        {children}
      </li>
    );
  }

  const initial = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
  const animate = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.li
      className={className}
      initial={initial}
      animate={animate}
      transition={{
        delay: index * 0.03,
        duration: 0.18,
        ease: "easeOut",
      }}
      {...dataAttributes}
    >
      {children}
    </motion.li>
  );
}
