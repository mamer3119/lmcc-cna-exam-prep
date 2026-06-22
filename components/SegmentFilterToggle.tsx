"use client";

import { useCallback, useSyncExternalStore } from "react";

import { SEGMENT_FILTER_LABELS } from "@/lib/practice-labels";
import {
  parseSegmentFilter,
  type SegmentFilterMode,
} from "@/lib/segment-filter";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getSnapshot(): SegmentFilterMode {
  if (typeof window === "undefined") {
    return "all";
  }
  return parseSegmentFilter(
    new URLSearchParams(window.location.search).get("filter"),
  );
}

function getServerSnapshot(): SegmentFilterMode {
  return "all";
}

type SegmentFilterToggleProps = {
  skillSlug: string;
};

export function SegmentFilterToggle({ skillSlug }: SegmentFilterToggleProps) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMode = useCallback((next: SegmentFilterMode) => {
    const url = new URL(window.location.href);
    if (next === "core") {
      url.searchParams.set("filter", "core");
    } else {
      url.searchParams.delete("filter");
    }
    window.history.replaceState(null, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  return (
    <div
      className="segment-filter-toggle print:hidden"
      role="group"
      aria-label={SEGMENT_FILTER_LABELS.groupAria}
      data-skill-slug={skillSlug}
    >
      <span className="segment-filter-toggle__label">Show:</span>
      <button
        type="button"
        className={`segment-filter-toggle__btn ${mode === "all" ? "segment-filter-toggle__btn--active" : ""}`}
        onClick={() => setMode("all")}
        aria-pressed={mode === "all"}
      >
        {SEGMENT_FILTER_LABELS.all}
      </button>
      <button
        type="button"
        className={`segment-filter-toggle__btn ${mode === "core" ? "segment-filter-toggle__btn--active" : ""}`}
        onClick={() => setMode("core")}
        aria-pressed={mode === "core"}
      >
        {SEGMENT_FILTER_LABELS.coreOnly}
      </button>
    </div>
  );
}

export function useSegmentFilterMode(): SegmentFilterMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
