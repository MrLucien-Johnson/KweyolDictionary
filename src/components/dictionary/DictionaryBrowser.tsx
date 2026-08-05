"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlphabetNav } from "@/components/dictionary/AlphabetNav";
import { DictionaryFilterLink } from "@/components/dictionary/DictionaryFilterLink";
import { SearchInsights } from "@/components/dictionary/SearchInsights";
import { SearchSuggest } from "@/components/dictionary/SearchSuggest";
import { WordCard } from "@/components/dictionary/WordCard";
import { listEntries } from "@/lib/content/catalog";
import {
  buildDictionaryHref,
  countActiveDictionaryFilters,
  needsHardDictionaryNavigation,
  withBasePath,
  type DictionaryFilterState,
} from "@/lib/dictionary/filter-url";

type DictionaryBrowserProps = {
  partsOfSpeech: string[];
  categories: { value: string; label: string }[];
};

function readFilters(searchParams: URLSearchParams): DictionaryFilterState {
  return {
    q: searchParams.get("q") ?? undefined,
    letter: searchParams.get("letter") ?? undefined,
    partOfSpeech: searchParams.get("pos") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    hasAudio: searchParams.get("audio") === "1",
    hasExamples: searchParams.get("examples") === "1",
    hasCulturalNotes: searchParams.get("cultural") === "1",
    featured: searchParams.get("featured") === "1",
    recent: searchParams.get("recent") === "1",
  };
}

function countMoreFilters(filters: DictionaryFilterState) {
  let count = 0;
  if (filters.difficulty) count += 1;
  if (filters.hasAudio) count += 1;
  if (filters.hasExamples) count += 1;
  if (filters.hasCulturalNotes) count += 1;
  if (filters.recent) count += 1;
  return count;
}

export function DictionaryBrowser({
  partsOfSpeech,
  categories,
}: DictionaryBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const [isPending, startFilterTransition] = useTransition();

  const filters = useMemo(
    () => readFilters(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryKey],
  );
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const moreFilterCount = countMoreFilters(filters);
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");
  const [searchPending, setSearchPending] = useState(false);
  const [moreOpen, setMoreOpen] = useState(
    () =>
      Boolean(
        filters.difficulty ||
          filters.hasAudio ||
          filters.hasExamples ||
          filters.hasCulturalNotes ||
          filters.recent,
      ),
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSearchDraft(filters.q ?? "");
      setSearchPending(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [filters.q]);

  function navigate(next: DictionaryFilterState) {
    const href = buildDictionaryHref(next);
    if (
      typeof window !== "undefined" &&
      needsHardDictionaryNavigation(window.location.search, href)
    ) {
      window.location.assign(withBasePath(href));
      return;
    }
    startFilterTransition(() => {
      router.push(href);
    });
  }

  function patchFilters(patch: Partial<DictionaryFilterState>) {
    const next: DictionaryFilterState = { ...filtersRef.current, ...patch };
    for (const key of Object.keys(patch) as (keyof DictionaryFilterState)[]) {
      const value = patch[key];
      if (value === "" || value === false || value == null) {
        delete next[key];
      }
    }
    filtersRef.current = next;
    navigate(next);
  }

  useEffect(() => {
    const nextQuery = searchDraft.trim();
    const currentQuery = (filtersRef.current.q ?? "").trim();
    if (nextQuery === currentQuery) {
      setSearchPending(false);
      return;
    }
    setSearchPending(true);
    const handle = window.setTimeout(() => {
      patchFilters({ q: nextQuery || undefined });
    }, 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const entries = useMemo(() => listEntries(filters), [filters]);
  const activeCount = countActiveDictionaryFilters(filters);
  const categoryLabel =
    categories.find((category) => category.value === filters.category)?.label ??
    filters.category;
  const updating = searchPending || isPending;
  const resultSummary = `${entries.length} ${
    entries.length === 1 ? "entry" : "entries"
  }${activeCount ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"}` : ""}`;

  return (
    <>
      <section className="dict-filters" aria-label="Dictionary filters">
        <div className="dict-filters__pin">
          <SearchSuggest
            id="dict-q"
            value={searchDraft}
            onChange={setSearchDraft}
            onSubmitQuery={(query) => {
              setSearchDraft(query);
              patchFilters({ q: query || undefined });
            }}
            formClassName="dict-filters__search"
            inputClassName="dict-filters__input dict-filters__input--search"
          />

          <AlphabetNav activeLetter={filters.letter} currentFilters={filters} />
        </div>

        <div className="dict-filters__grid">
          <label>
            Part of speech
            <select
              value={filters.partOfSpeech ?? ""}
              onChange={(event) =>
                patchFilters({ partOfSpeech: event.target.value || undefined })
              }
            >
              <option value="">Any</option>
              {partsOfSpeech.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select
              value={filters.category ?? ""}
              onChange={(event) =>
                patchFilters({ category: event.target.value || undefined })
              }
            >
              <option value="">Any</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <div className="dict-filters__quick">
            <span className="dict-filters__quick-label">Quick filters</span>
            <div className="dict-filters__toggles">
              <button
                type="button"
                className={
                  filters.featured
                    ? "dict-filters__toggle is-active"
                    : "dict-filters__toggle"
                }
                aria-pressed={Boolean(filters.featured)}
                onClick={() =>
                  patchFilters({ featured: !filtersRef.current.featured })
                }
              >
                Featured
              </button>
              <button
                type="button"
                className={
                  filters.recent
                    ? "dict-filters__toggle is-active"
                    : "dict-filters__toggle"
                }
                aria-pressed={Boolean(filters.recent)}
                onClick={() =>
                  patchFilters({ recent: !filtersRef.current.recent })
                }
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="dict-filters__more-toggle"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
        >
          {moreOpen ? "Hide more filters" : "More filters"}
          {moreFilterCount > 0 ? ` · ${moreFilterCount}` : ""}
        </button>

        {moreOpen ? (
          <div className="dict-filters__more">
            <label>
              Difficulty
              <select
                value={filters.difficulty ?? ""}
                onChange={(event) =>
                  patchFilters({ difficulty: event.target.value || undefined })
                }
              >
                <option value="">Any</option>
                <option value="BEGINNER">Beginner</option>
                <option value="ELEMENTARY">Elementary</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
            <fieldset className="dict-filters__checks">
              <legend className="sr-only">Content filters</legend>
              <label className="dict-filters__check">
                <input
                  type="checkbox"
                  checked={Boolean(filters.hasAudio)}
                  onChange={(event) =>
                    patchFilters({ hasAudio: event.target.checked })
                  }
                />
                <span>With audio</span>
              </label>
              <label className="dict-filters__check">
                <input
                  type="checkbox"
                  checked={Boolean(filters.hasExamples)}
                  onChange={(event) =>
                    patchFilters({ hasExamples: event.target.checked })
                  }
                />
                <span>With examples</span>
              </label>
              <label className="dict-filters__check">
                <input
                  type="checkbox"
                  checked={Boolean(filters.hasCulturalNotes)}
                  onChange={(event) =>
                    patchFilters({ hasCulturalNotes: event.target.checked })
                  }
                />
                <span>With cultural notes</span>
              </label>
            </fieldset>
          </div>
        ) : null}

        {activeCount > 0 ? (
          <div className="dict-filters__chips" aria-label="Active filters">
            {filters.q ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label={`Remove search filter: ${filters.q}`}
                onClick={() => {
                  setSearchDraft("");
                  patchFilters({ q: undefined });
                }}
              >
                Search: {filters.q} ×
              </button>
            ) : null}
            {filters.letter ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label={`Remove letter filter: ${filters.letter.toUpperCase()}`}
                onClick={() => patchFilters({ letter: undefined })}
              >
                Letter: {filters.letter.toUpperCase()} ×
              </button>
            ) : null}
            {filters.partOfSpeech ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label={`Remove part of speech filter: ${filters.partOfSpeech}`}
                onClick={() => patchFilters({ partOfSpeech: undefined })}
              >
                {filters.partOfSpeech} ×
              </button>
            ) : null}
            {filters.category ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label={`Remove category filter: ${categoryLabel}`}
                onClick={() => patchFilters({ category: undefined })}
              >
                {categoryLabel} ×
              </button>
            ) : null}
            {filters.difficulty ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label={`Remove difficulty filter: ${filters.difficulty}`}
                onClick={() => patchFilters({ difficulty: undefined })}
              >
                {filters.difficulty} ×
              </button>
            ) : null}
            {filters.featured ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label="Remove featured filter"
                onClick={() => patchFilters({ featured: false })}
              >
                Featured ×
              </button>
            ) : null}
            {filters.recent ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label="Remove recent filter"
                onClick={() => patchFilters({ recent: false })}
              >
                Recent ×
              </button>
            ) : null}
            {filters.hasAudio ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label="Remove with audio filter"
                onClick={() => patchFilters({ hasAudio: false })}
              >
                With audio ×
              </button>
            ) : null}
            {filters.hasExamples ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label="Remove with examples filter"
                onClick={() => patchFilters({ hasExamples: false })}
              >
                With examples ×
              </button>
            ) : null}
            {filters.hasCulturalNotes ? (
              <button
                type="button"
                className="dict-filters__chip"
                aria-label="Remove with cultural notes filter"
                onClick={() => patchFilters({ hasCulturalNotes: false })}
              >
                With cultural notes ×
              </button>
            ) : null}
            <DictionaryFilterLink
              href="/dictionary/"
              className="dict-filters__clear"
            >
              Clear all
            </DictionaryFilterLink>
          </div>
        ) : null}
      </section>

      <div className="dict-page__toolbar">
        <p
          className="dict-page__count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-busy={updating}
        >
          {updating ? "Updating results…" : resultSummary}
        </p>
        <Link href="/dictionary/favourites" className="text-link">
          View favourites
        </Link>
      </div>

      {filters.q?.trim() ? (
        <SearchInsights
          query={filters.q}
          resultSlugs={entries.map((entry) => entry.slug)}
          resultCount={entries.length}
        />
      ) : null}

      {entries.length === 0 ? (
        <div className="empty-state" role="status">
          <h2>No matching entries</h2>
          <p>
            {filters.q?.trim()
              ? "Try another spelling, clear a filter, or pick a suggestion if one is shown above."
              : "Try clearing filters or browse by letter."}
          </p>
          <Link href="/dictionary/" className="btn btn--soft btn--md">
            Clear filters
          </Link>
        </div>
      ) : (
        <div
          className={
            updating ? "word-grid word-grid--pending" : "word-grid"
          }
          aria-busy={updating}
        >
          {entries.map((entry) => (
            <WordCard
              key={entry.id}
              slug={entry.slug}
              kweyolWord={entry.kweyolWord}
              englishTranslation={entry.englishTranslation}
              partOfSpeech={entry.partOfSpeech}
              pronunciationGuide={entry.pronunciationGuide}
              audioSrc={
                entry.audioFiles.find((file) => file.status !== "MISSING")
                  ?.filePath
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
