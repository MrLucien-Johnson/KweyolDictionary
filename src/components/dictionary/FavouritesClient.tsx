"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listEntries } from "@/lib/content/catalog";
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
    const frame = requestAnimationFrame(() => {
      const slugs = new Set(getFavouriteSlugs());
      const matched = listEntries({}).filter((entry) => slugs.has(entry.slug));
      setEntries(matched);
      setLoading(false);
    });
    return () => cancelAnimationFrame(frame);
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
