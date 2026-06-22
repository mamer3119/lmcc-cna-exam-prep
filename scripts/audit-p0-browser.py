"""P0 surface-config + hydration browser audit — captures screenshots."""

import re
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:3005/lmcc-cna-exam-prep"
OUT = Path(__file__).resolve().parent.parent / "audit-screenshots"
OUT.mkdir(parents=True, exist_ok=True)


def assert_visible(page, selector: str, label: str) -> None:
    loc = page.locator(selector).first
    if loc.count() == 0 or not loc.is_visible():
        raise AssertionError(f"Missing or hidden: {label} ({selector})")


def run() -> None:
    results: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        page.goto(f"{BASE}/", wait_until="networkidle")
        page.screenshot(path=str(OUT / "01-index.png"), full_page=True)
        results.append("index OK")

        page.goto(f"{BASE}/skills/manual-blood-pressure/", wait_until="networkidle")
        assert_visible(page, ".student-focus-banner", "student focus banner")
        assert_visible(page, ".exam-numbers-summary", "BP exam numbers summary")
        page.screenshot(path=str(OUT / "02-bp-study.png"), full_page=True)
        results.append("bp-study: banner + summary (#21d summary-only)")

        page.goto(
            f"{BASE}/skills/weight-ambulatory-client/",
            wait_until="networkidle",
        )
        page.get_by_role("button", name=re.compile(r"Hide & reveal", re.I)).click()
        page.wait_for_timeout(600)
        scorecards = page.locator(".exam-scorecard")
        if scorecards.count() == 0:
            raise AssertionError(
                "Expected inline .exam-scorecard in quiz mode (hidden steps, R7)"
            )
        page.screenshot(path=str(OUT / "03-weight-quiz.png"), full_page=True)
        results.append(
            f"weight-quiz: {scorecards.count()} scorecard(s) on hidden steps"
        )

        page.goto(
            f"{BASE}/skills/urinary-output-measurement/",
            wait_until="networkidle",
        )
        assert_visible(page, ".student-focus-banner", "urinary student focus")
        substeps = page.get_by_label(re.compile(r"sub-step", re.I))
        if substeps.count() < 2:
            raise AssertionError(
                f"Expected >=2 GLOVE_REMOVE sub-steps, got {substeps.count()}"
            )
        page.screenshot(path=str(OUT / "04-urinary-substeps.png"), full_page=True)
        results.append(f"urinary: {substeps.count()} hydrated sub-steps")

        page.goto(f"{BASE}/study/", wait_until="networkidle")
        page.screenshot(path=str(OUT / "05-study.png"), full_page=True)
        results.append("study page OK")

        browser.close()

    print("AUDIT PASS")
    for line in results:
        print(f"  - {line}")
    print(f"Screenshots: {OUT}")


if __name__ == "__main__":
    run()
