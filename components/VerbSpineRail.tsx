"use client";

import type { Module } from "@/data/skillCurriculum";

type VerbSpineRailProps = {
  modules: Module[];
  activeModuleOrder: number;
  masteredByModule: Record<number, { done: number; total: number }>;
  onJump: (moduleOrder: number) => void;
};

export default function VerbSpineRail({
  modules,
  activeModuleOrder,
  masteredByModule,
  onJump,
}: VerbSpineRailProps) {
  return (
    <nav
      className="verb-spine-rail"
      aria-label="Study pathway — Protect through Eliminate"
    >
      <ol className="verb-spine-rail__list">
        {modules.map((mod) => {
          const stats = masteredByModule[mod.order] ?? {
            done: 0,
            total: mod.skillSlugs.length,
          };
          const isActive = mod.order === activeModuleOrder;
          return (
            <li key={mod.order} className="verb-spine-rail__item">
              <button
                type="button"
                className={`verb-spine-rail__btn ${isActive ? "verb-spine-rail__btn--active" : ""}`}
                onClick={() => onJump(mod.order)}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="verb-spine-rail__verb">{mod.verb}</span>
                <span className="verb-spine-rail__count">
                  {stats.done}/{stats.total}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
