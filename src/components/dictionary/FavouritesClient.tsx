"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WordCard } from "@/components/dictionary/WordCard";
import { pickPlayableAudio } from "@/lib/audio/pick";
import { listEntries } from "@/lib/content/catalog";
import type { PublishedEntry } from "@/lib/content/types";
import {
  getFavouriteSlugs,
  removeFavouriteSlug,
} from "@/lib/favourites/storage";

export function FavouritesClient() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSlugs(getFavouriteSlugs());
      setLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const entries = useMemo(() => {
    const catalog = listEntries({});
    const bySlug = new Map(catalog.map((entry) => [entry.slug, entry]));
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((entry): entry is PublishedEntry => Boolean(entry));
  }, [slugs]);

  if (loading) {
    return <p className="loading-line">Loading favourites…</p>;
  }

  if (!entries.length) {
    return (
      <div className="empty-state">
        <h2>No favourites yet</h2>
        <p>
          Open any approved word and choose <strong>Save to favourites</strong>.
          Saved words stay on this device for study later.
        </p>
        <div className="empty-state__actions">
          <Link href="/dictionary/" className="btn btn--primary btn--md">
            Browse dictionary
          </Link>
          <Link href="/practice/" className="btn btn--soft btn--md">
            Practice games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favourites-hub">
      <div className="favourites-hub__toolbar no-print">
        <p className="dict-page__count">
          {entries.length} saved {entries.length === 1 ? "word" : "words"}
        </p>
        <div className="favourites-hub__actions">
          <Link
            href="/learn/flashcards?deck=favourites"
            className="btn btn--primary btn--md"
          >
            Study flashcards
          </Link>
          <Link href="/practice/" className="btn btn--soft btn--md">
            Practice games
          </Link>
          <button
            type="button"
            className="btn btn--soft btn--md"
            onClick={() => window.print()}
          >
            Print study sheet
          </button>
        </div>
      </div>

      <div className="favourites-print-sheet" aria-hidden="true">
        <h2>Favourites study sheet</h2>
        <ul>
          {entries.map((entry) => (
            <li key={`print-${entry.slug}`}>
              <strong>{entry.kweyolWord}</strong> — {entry.englishTranslation}
              {entry.pronunciationGuide ? ` /${entry.pronunciationGuide}/` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="word-grid favourites-hub__grid">
        {entries.map((entry) => {
          const audio = pickPlayableAudio(entry);
          return (
            <div key={entry.slug} className="favourites-hub__card">
              <WordCard
                slug={entry.slug}
                kweyolWord={entry.kweyolWord}
                englishTranslation={entry.englishTranslation}
                partOfSpeech={entry.partOfSpeech}
                pronunciationGuide={entry.pronunciationGuide}
                audioSrc={audio?.filePath}
                audioSource={audio?.source}
              />
              <button
                type="button"
                className="favourites-hub__remove no-print"
                aria-label={`Remove ${entry.kweyolWord} from favourites`}
                onClick={() => setSlugs(removeFavouriteSlug(entry.slug))}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
