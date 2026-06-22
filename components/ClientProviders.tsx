"use client";

import type { ReactNode } from "react";

import { InstructorViewProvider } from "@/components/InstructorViewProvider";

/** App-wide client providers — no useSearchParams; safe for static export SSG. */
export function ClientProviders({ children }: { children: ReactNode }) {
  return <InstructorViewProvider>{children}</InstructorViewProvider>;
}
