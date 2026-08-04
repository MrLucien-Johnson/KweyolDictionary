"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import {
  needsHardDictionaryNavigation,
  withBasePath,
} from "@/lib/dictionary/filter-url";

type DictionaryFilterLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: "page" | undefined;
};

/**
 * Link that forces a full navigation when clearing query params on the same
 * path — required for GitHub Pages static export, where Next soft-nav can
 * leave stale ?letter=… in the URL.
 */
export function DictionaryFilterLink({
  href,
  className,
  children,
  "aria-current": ariaCurrent,
}: DictionaryFilterLinkProps) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (typeof window === "undefined") return;
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;

    if (needsHardDictionaryNavigation(window.location.search, href)) {
      event.preventDefault();
      window.location.assign(withBasePath(href));
    }
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={ariaCurrent}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
