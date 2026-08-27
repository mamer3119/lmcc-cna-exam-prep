import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
  }
});
