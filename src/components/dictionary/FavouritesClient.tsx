"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFavouriteSlugs } from "@/lib/favourites/storage";

type FavouriteEntry = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
};

export function FavouritesClient() {
  const [entries, setEntries] = useState<FavouriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const slugs = getFavouriteSlugs();

    void (async () => {
      if (!slugs.length) {
        if (!cancelled) {
          setEntries([]);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/dictionary/by-slugs?slugs=${encodeURIComponent(slugs.join(","))}`,
        );
        const data = (await response.json()) as { entries: FavouriteEntry[] };
        if (!cancelled) {
          setEntries(data.entries ?? []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="loading-line">Loading favourites…</p>;
  }

  if (!entries.length) {
    return (
      <div className="empty-state">
        <h2>No favourites yet</h2>
        <p>
          Open any approved word and choose <strong>Save to favourites</strong>.
        </p>
        <Link href="/dictionary" className="btn btn--primary btn--md">
          Browse dictionary
        </Link>
      </div>
    );
  }

  return (
    <ul className="related-list">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link href={`/dictionary/${entry.slug}`}>{entry.kweyolWord}</Link>
          <span> — {entry.englishTranslation}</span>
        </li>
      ))}
    </ul>
  );
}
