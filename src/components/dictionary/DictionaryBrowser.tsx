"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlphabetNav } from "@/components/dictionary/AlphabetNav";
import { WordCard } from "@/components/dictionary/WordCard";
import { listEntries } from "@/lib/content/catalog";
import {
  buildDictionaryHref,
  countActiveDictionaryFilters,
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

export function DictionaryBrowser({
  partsOfSpeech,
  categories,
}: DictionaryBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();

  const filters = useMemo(
    () => readFilters(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryKey],
  );
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");
  const [moreOpen, setMoreOpen] = useState(
    Boolean(filters.difficulty || filters.hasAudio || filters.recent),
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSearchDraft(filters.q ?? "");
    });
    return () => cancelAnimationFrame(frame);
  }, [filters.q]);

  function navigate(next: DictionaryFilterState) {
    startTransition(() => {
      router.push(buildDictionaryHref(next));
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
    const handle = window.setTimeout(() => {
      const nextQuery = searchDraft.trim();
      const currentQuery = (filtersRef.current.q ?? "").trim();
      if (nextQuery === currentQuery) return;
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

  return (
    <>
      <section className="dict-filters" aria-label="Dictionary filters">
        <form
          className="dict-filters__search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem("q");
            const raw =
              input && typeof input === "object" && "value" in input
                ? String((input as unknown as HTMLInputElement).value)
                : searchDraft;
            const query = raw.trim();
            setSearchDraft(query);
            patchFilters({ q: query || undefined });
          }}
        >
          <label className="sr-only" htmlFor="dict-q">
            Search Kwéyòl or English
          </label>
          <input
            id="dict-q"
            name="q"
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search Kwéyòl or English…"
            className="dict-filters__input dict-filters__input--search"
            autoComplete="off"
          />
          <button type="submit" className="btn btn--primary btn--md">
            Search
          </button>
        </form>

        <AlphabetNav activeLetter={filters.letter} currentFilters={filters} />

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
                onClick={() => patchFilters({ featured: !filtersRef.current.featured })}
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
                onClick={() => patchFilters({ recent: !filtersRef.current.recent })}
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
                onClick={() => patchFilters({ letter: undefined })}
              >
                Letter: {filters.letter.toUpperCase()} ×
              </button>
            ) : null}
            {filters.partOfSpeech ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ partOfSpeech: undefined })}
              >
                {filters.partOfSpeech} ×
              </button>
            ) : null}
            {filters.category ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ category: undefined })}
              >
                {categoryLabel} ×
              </button>
            ) : null}
            {filters.difficulty ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ difficulty: undefined })}
              >
                {filters.difficulty} ×
              </button>
            ) : null}
            {filters.featured ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ featured: false })}
              >
                Featured ×
              </button>
            ) : null}
            {filters.recent ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ recent: false })}
              >
                Recent ×
              </button>
            ) : null}
            {filters.hasAudio ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ hasAudio: false })}
              >
                With audio ×
              </button>
            ) : null}
            {filters.hasExamples ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ hasExamples: false })}
              >
                With examples ×
              </button>
            ) : null}
            {filters.hasCulturalNotes ? (
              <button
                type="button"
                className="dict-filters__chip"
                onClick={() => patchFilters({ hasCulturalNotes: false })}
              >
                With cultural notes ×
              </button>
            ) : null}
            <Link href="/dictionary" className="dict-filters__clear">
              Clear all
            </Link>
          </div>
        ) : null}
      </section>

      <div className="dict-page__toolbar">
        <p>
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
          {activeCount
            ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"}`
            : ""}
        </p>
        <Link href="/dictionary/favourites" className="text-link">
          View favourites
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state" role="status">
          <h2>No matching entries</h2>
          <p>Try another spelling, clear filters, or browse by letter.</p>
          <Link href="/dictionary" className="btn btn--soft btn--md">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="word-grid">
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
