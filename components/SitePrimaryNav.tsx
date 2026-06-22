"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Skills" },
  { href: "/framework/", label: "Framework" },
  { href: "/framework/pathway/", label: "Pathway" },
  { href: "/study/", label: "Study" },
] as const;

export function SitePrimaryNav() {
  const pathname = usePathname() ?? "";

  function isActive(href: string): boolean {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="site-primary-nav print:hidden" aria-label="Site">
      <ol className="site-primary-nav__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`site-primary-nav__link ${isActive(item.href) ? "site-primary-nav__link--active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
