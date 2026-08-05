"use client";

import Link from "next/link";
import { useMemo } from "react";
import { listEntries } from "@/lib/content/catalog";
import {
  didYouMean,
  findRelatedForQuery,
  findSimilarEntries,
  matchKindLabel,
} from "@/lib/search/suggest";

type SearchInsightsProps = {
  query: string;
  /** Slugs already shown in the main results grid. */
  resultSlugs: string[];
  resultCount: number;
};

export function SearchInsights({
  query,
  resultSlugs,
  resultCount,
}: SearchInsightsProps) {
  const trimmed = query.trim();
  const catalog = useMemo(() => listEntries({}), []);

  const insights = useMemo(() => {
    if (!trimmed) {
      return {
        correction: null,
        similar: [] as ReturnType<typeof findSimilarEntries>,
        related: [] as ReturnType<typeof findRelatedForQuery>,
      };
    }

    const exclude = new Set(resultSlugs);
    const correction = didYouMean(trimmed, catalog);
    if (correction) exclude.add(correction.slug);

    return {
      correction,
      similar: findSimilarEntries(trimmed, catalog, {
        limit: 6,
        excludeSlugs: exclude,
      }),
      related: findRelatedForQuery(trimmed, catalog, 8),
    };
  }, [catalog, resultSlugs, trimmed]);

  if (!trimmed) return null;

  const { correction, similar, related } = insights;
  if (!correction && !similar.length && !related.length) return null;

  return (
    <section className="search-insights" aria-label="Search suggestions">
      {correction ? (
        <div className="search-insights__block search-insights__block--didyoumean">
          <h2>Did you mean…?</h2>
          <p>
            No close exact match for “{trimmed}”. Closest spelling:{" "}
            <Link href={`/dictionary/${correction.slug}`}>
              {correction.kweyolWord}
            </Link>{" "}
            — {correction.englishTranslation}
            <span className="search-insights__tag">
              {matchKindLabel(correction.matchKind)}
            </span>
          </p>
          <p className="search-insights__hint">
            <Link
              href={`/dictionary/?q=${encodeURIComponent(correction.kweyolWord)}`}
            >
              Search for {correction.kweyolWord}
            </Link>
          </p>
        </div>
      ) : null}

      {resultCount === 0 && !correction ? (
        <div className="search-insights__block">
          <h2>No exact matches</h2>
          <p>Try a shorter spelling, browse by letter, or pick a similar word below.</p>
        </div>
      ) : null}

      {similar.length ? (
        <div className="search-insights__block">
          <h2>Similar words</h2>
          <p>Words that look or sound close to your search.</p>
          <ul className="search-insights__list">
            {similar.map((item) => (
              <li key={item.slug}>
                <Link href={`/dictionary/${item.slug}`}>
                  {item.kweyolWord}
                </Link>
                <span className="search-insights__english">
                  {item.englishTranslation}
                </span>
                <span className="search-insights__tag">
                  {matchKindLabel(item.matchKind)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {related.length ? (
        <div className="search-insights__block">
          <h2>Related meanings</h2>
          <p>Antonyms, synonyms, and linked words for your search.</p>
          <ul className="search-insights__list">
            {related.map((item) => (
              <li key={`${item.kind}-${item.slug}-${item.viaSlug}`}>
                <Link href={`/dictionary/${item.slug}`}>
                  {item.kweyolWord}
                </Link>
                <span className="search-insights__english">
                  {item.englishTranslation}
                </span>
                <span className="search-insights__tag">{item.label}</span>
                <span className="search-insights__via">
                  linked from {item.viaKweyolWord}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
