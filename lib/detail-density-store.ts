"use client";

import type { DetailDensity } from "@/lib/practice-labels";

export type DetailDensitySnapshot = {
  density: DetailDensity;
};

export const detailDensityServerSnapshot: DetailDensitySnapshot = {
  density: "standard",
};

type Listener = () => void;

const listeners = new Set<Listener>();
let mounted = false;

/** In-memory — persists across skill rail navigation within session. */
let currentDensity: DetailDensity = "standard";

let cachedSnapshot: DetailDensitySnapshot = detailDensityServerSnapshot;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function scheduleEmit(): void {
  queueMicrotask(emit);
}

function recomputeSnapshot(): DetailDensitySnapshot {
  const next: DetailDensitySnapshot = { density: currentDensity };
  if (cachedSnapshot.density !== next.density) {
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

export function getDetailDensitySnapshot(): DetailDensitySnapshot {
  return recomputeSnapshot();
}

export function setDetailDensity(density: DetailDensity): void {
  if (currentDensity === density) {
    return;
  }
  currentDensity = density;
  scheduleEmit();
}

export function subscribeDetailDensity(listener: Listener): () => void {
  listeners.add(listener);
  if (!mounted) {
    mounted = true;
    scheduleEmit();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      mounted = false;
    }
  };
}
