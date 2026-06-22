/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getInstructorViewServerSnapshot,
  getInstructorViewSnapshot,
  resetInstructorViewStoreForTests,
  subscribeInstructorView,
} from "@/lib/instructor-view-store";

describe("instructor-view-store", () => {
  afterEach(() => {
    resetInstructorViewStoreForTests();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
  });

  it("server snapshot is student-safe defaults", () => {
    expect(getInstructorViewServerSnapshot()).toEqual({
      instructorView: false,
      ready: false,
    });
  });

  it("client snapshot stays server-safe until subscribe mounts store", () => {
    expect(getInstructorViewSnapshot()).toEqual({
      instructorView: false,
      ready: false,
    });
  });

  it("subscribe notifies via microtask not synchronously", async () => {
    const listener = vi.fn();
    const unsub = subscribeInstructorView(listener);

    expect(listener).not.toHaveBeenCalled();

    await new Promise<void>((resolve) => {
      queueMicrotask(resolve);
    });
    expect(listener).toHaveBeenCalled();

    unsub();
  });

  it("reads ?instructor=true after mount notification", async () => {
    window.history.replaceState({}, "", "/?instructor=true");

    const listener = vi.fn();
    const unsub = subscribeInstructorView(listener);
    await new Promise<void>((resolve) => {
      queueMicrotask(resolve);
    });

    expect(getInstructorViewSnapshot()).toEqual({
      instructorView: true,
      ready: true,
    });

    unsub();
  });
});
