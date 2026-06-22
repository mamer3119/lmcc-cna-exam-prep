"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

import type { ChecklistStep } from "@/lib/checklist-step";
import {
  canonicalSequenceIds,
  checkSequenceOrder,
  initShuffledOrder,
  reshuffleMisplacedOnly,
  toSequenceDrillSteps,
  type SequenceDrillStep,
} from "@/lib/sequence-drill";

type StepFeedback = "idle" | "correct" | "misplaced";

type SequenceDrillProps = {
  steps: ChecklistStep[];
  skillSlug: string;
  title: string;
};

function SortableDrillRow({
  step,
  feedback,
  locked,
}: {
  step: SequenceDrillStep;
  feedback: StepFeedback;
  locked: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id, disabled: locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`sequence-drill-row sequence-drill-row--${feedback} ${locked ? "sequence-drill-row--locked" : ""} ${isDragging ? "sequence-drill-row--dragging" : ""} ${step.critical && feedback === "misplaced" ? "sequence-drill-row--critical-misplaced" : ""}`.trim()}
      {...attributes}
    >
      <button
        type="button"
        className="sequence-drill-handle"
        aria-label={`Drag step ${step.stepId} to reorder`}
        {...listeners}
        disabled={locked}
      >
        ⠿
      </button>
      <span className="sequence-drill-row__body">
        <span className="sequence-drill-row__num tnum">{step.stepId}.</span>{" "}
        {step.title}
        {feedback === "correct" ?
          <span className="sequence-drill-row__ok" aria-hidden>
            {" "}
            ✓
          </span>
        : null}
        {step.critical && feedback === "misplaced" && step.coachingHint ?
          <span className="sequence-drill-row__critical-note">
            {step.coachingHint}
          </span>
        : null}
      </span>
    </li>
  );
}

export function SequenceDrill({ steps, skillSlug, title }: SequenceDrillProps) {
  const canonical = useMemo(() => canonicalSequenceIds(steps), [steps]);
  const drillStepsById = useMemo(() => {
    const map = new Map<string, SequenceDrillStep>();
    for (const s of toSequenceDrillSteps(steps, skillSlug)) {
      map.set(s.id, s);
    }
    return map;
  }, [steps, skillSlug]);

  const [order, setOrder] = useState<string[]>(() =>
    initShuffledOrder(canonical),
  );
  const [lockedIds, setLockedIds] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState<Record<string, StepFeedback>>({});
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    setOrder((items) => {
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) {
        return items;
      }
      return arrayMove(items, oldIndex, newIndex);
    });
    setFeedback({});
    setLastResult(null);
  }, []);

  const handleCheck = useCallback(() => {
    const result = checkSequenceOrder(order, canonical);
    const nextFeedback: Record<string, StepFeedback> = {};
    for (let i = 0; i < canonical.length; i += 1) {
      const id = order[i]!;
      nextFeedback[id] = id === canonical[i] ? "correct" : "misplaced";
    }
    setFeedback(nextFeedback);
    setLastResult(
      result.allCorrect ?
        "All steps in correct order."
      : `${result.correctCount} correct, ${result.misplacedIds.length} to fix`,
    );
    if (!result.allCorrect) {
      setShakeKey((k) => k + 1);
    }
  }, [order, canonical]);

  const handleTryAgain = useCallback(() => {
    const { order: nextOrder, lockedIds: nextLocked } = reshuffleMisplacedOnly(
      order,
      canonical,
      Date.now(),
    );
    setOrder(nextOrder);
    setLockedIds(nextLocked);
    const nextFeedback: Record<string, StepFeedback> = {};
    for (const id of nextLocked) {
      nextFeedback[id] = "correct";
    }
    setFeedback(nextFeedback);
    setLastResult(null);
  }, [order, canonical]);

  return (
    <section className="sequence-drill" aria-labelledby="sequence-drill-title">
      <h2 id="sequence-drill-title" className="sequence-drill-title">
        Sequence drill — {title}
      </h2>
      <p className="sequence-drill-lead">
        Drag {canonical.length} scored steps into the correct exam order, then
        check your sequence.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <motion.ul
            key={shakeKey}
            className="sequence-drill-list"
            animate={
              shakeKey > 0 && lastResult && !lastResult.startsWith("All") ?
                { x: [0, -6, 6, -6, 6, 0] }
              : { x: 0 }
            }
            transition={{ duration: 0.2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
          >
            {order.map((id) => {
              const step = drillStepsById.get(id);
              if (!step) {
                return null;
              }
              return (
                <SortableDrillRow
                  key={id}
                  step={step}
                  feedback={feedback[id] ?? "idle"}
                  locked={lockedIds.has(id)}
                />
              );
            })}
          </motion.ul>
        </SortableContext>
      </DndContext>

      <div
        className="sequence-drill-live sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {lastResult}
      </div>

      <div className="sequence-drill-actions">
        <button
          type="button"
          className="sequence-drill-btn"
          onClick={handleCheck}
        >
          Check order
        </button>
        {lastResult && !lastResult.startsWith("All") ?
          <button
            type="button"
            className="sequence-drill-btn sequence-drill-btn--secondary"
            onClick={handleTryAgain}
          >
            Try again
          </button>
        : null}
      </div>

      {lastResult ?
        <p className="sequence-drill-result" role="status">
          {lastResult}
        </p>
      : null}
    </section>
  );
}
