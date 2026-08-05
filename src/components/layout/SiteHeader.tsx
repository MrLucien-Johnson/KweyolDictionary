"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROJECT_NAME } from "@/lib/content/editorial";

const navItems = [
  { href: "/dictionary", label: "Dictionary", shortLabel: "Dictionary" },
  { href: "/children", label: "Children’s", shortLabel: "Children" },
  { href: "/practice", label: "Practice", shortLabel: "Practice" },
  { href: "/learn", label: "Learn", shortLabel: "Learn" },
  { href: "/contribute", label: "Contribute", shortLabel: "Contribute" },
] as const;

function pathMatches(pathname: string, href: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (target === "/") return normalized === "/";
  return normalized === target || normalized.startsWith(`${target}/`);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  // Strip basePath if present so matching works on GitHub Pages.
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const localPath =
    base && pathname.startsWith(base)
      ? pathname.slice(base.length) || "/"
      : pathname;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand">
          <span className="site-brand__mark" aria-hidden="true" />
          <span className="site-brand__text">{PROJECT_NAME}</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => {
            const current = pathMatches(localPath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  current ? "site-nav__link is-current" : "site-nav__link"
                }
                aria-current={current ? "page" : undefined}
              >
                <span className="site-nav__label">{item.label}</span>
                <span className="site-nav__label-short">{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
