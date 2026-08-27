"use client";

import Link from "next/link";

export default function PathwayCards() {
  return (
    <nav
      className="pathway-cards"
      aria-label="Choose how you want to use the LMCC CNA study guide"
    >
      <Link href="/skills/" className="pathway-card pathway-card--lmcc">
        <h2 className="pathway-card__title">I study at LMCC</h2>
        <p className="pathway-card__description">
          Follow the LMCC recommended study path and practice the 22 official
          CNA skills.
        </p>
        <span className="pathway-card__cta">Start studying →</span>
      </Link>
    </nav>
  );
}
