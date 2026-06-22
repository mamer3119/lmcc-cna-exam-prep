"use client";

import { useEffect, useState } from "react";

import { EXAM_REALITY_BANNER_DISMISS_KEY } from "@/lib/exam-meta";

export default function ExamRealityBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(EXAM_REALITY_BANNER_DISMISS_KEY);
      setVisible(dismissed !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(EXAM_REALITY_BANNER_DISMISS_KEY, "1");
    } catch {
      // Ignore private-mode errors
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <aside
      className="exam-reality-banner print:hidden"
      role="region"
      aria-label="How the State Skills Exam Works"
    >
      <div className="exam-reality-banner-inner">
        <div className="exam-reality-banner-content">
          <h2 className="exam-reality-banner-title">
            How the State Skills Exam Works
          </h2>
          <ul className="exam-reality-banner-list">
            <li>You will perform 5 skills total</li>
            <li>
              ✅ Hand Hygiene — ALWAYS tested. Guaranteed on every exam.
            </li>
            <li>
              📏 At least 1 Measurement skill is always drawn (Blood Pressure,
              Weight, Urinary Output, Radial Pulse, or Respirations)
            </li>
            <li>
              The remaining 3 are randomly selected from the full 22-skill list
            </li>
          </ul>
        </div>
        <button
          type="button"
          className="exam-reality-banner-dismiss"
          onClick={dismiss}
          aria-label="Dismiss exam info banner"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
