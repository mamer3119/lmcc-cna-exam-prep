"use client";

import { useSyncExternalStore } from "react";

import {
  getInstructorViewServerSnapshot,
  getInstructorViewSnapshot,
  subscribeInstructorView,
} from "@/lib/instructor-view-store";

const INSTRUCTOR_PARAM = "instructor";

export function isInstructorViewFromParams(
  params: Pick<URLSearchParams, "get">,
): boolean {
  const value = params.get(INSTRUCTOR_PARAM);
  return value === "true" || value === "1";
}

export function readInstructorViewFromWindow(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return isInstructorViewFromParams(
    new URLSearchParams(window.location.search),
  );
}

/**
 * Fallback when InstructorViewProvider is absent (tests / isolated mounts).
 * Prefer useInstructorViewContext() in app routes.
 */
export function useInstructorView(): boolean {
  const state = useSyncExternalStore(
    subscribeInstructorView,
    getInstructorViewSnapshot,
    getInstructorViewServerSnapshot,
  );
  return state.instructorView;
}
