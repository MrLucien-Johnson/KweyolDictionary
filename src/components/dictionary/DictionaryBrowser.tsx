"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlphabetNav } from "@/components/dictionary/AlphabetNav";
import { WordCard } from "@/components/dictionary/WordCard";
import { listEntries } from "@/lib/content/catalog";

type DictionaryBrowserProps = {
  partsOfSpeech: string[];
  categories: { value: string; label: string }[];
};

export function DictionaryBrowser({
  partsOfSpeech,
  categories,
}: DictionaryBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryKey = searchParams.toString();
  const filters = useMemo(
    () => ({
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
    }),
    // searchParams identity changes; queryKey captures the meaningful URL state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryKey],
  );

  const entries = useMemo(() => listEntries(filters), [filters]);

  function updateParams(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of [
      "q",
      "letter",
      "pos",
      "category",
      "difficulty",
      "audio",
      "examples",
      "cultural",
      "featured",
      "recent",
    ]) {
      const value = formData.get(key);
      if (typeof value === "string" && value) params.set(key, value);
    }
    const letter = searchParams.get("letter");
    if (letter && !formData.has("letter")) params.set("letter", letter);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <>
      <AlphabetNav activeLetter={filters.letter} />

      <form
        className="dict-filters"
        onSubmit={(event) => {
          event.preventDefault();
          updateParams(new FormData(event.currentTarget));
        }}
      >
        <div className="dict-filters__row">
          <label className="dict-filters__label" htmlFor="dict-q">
            Search
          </label>
          <input
            id="dict-q"
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            placeholder="Kwéyòl or English"
            className="dict-filters__input"
          />
        </div>
        <div className="dict-filters__grid">
          <label>
            Part of speech
            <select name="pos" defaultValue={filters.partOfSpeech ?? ""}>
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
            <select name="category" defaultValue={filters.category ?? ""}>
              <option value="">Any</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select name="difficulty" defaultValue={filters.difficulty ?? ""}>
              <option value="">Any</option>
              <option value="BEGINNER">Beginner</option>
              <option value="ELEMENTARY">Elementary</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
        </div>
        <fieldset className="dict-filters__checks">
          <legend className="sr-only">Content filters</legend>
          <label>
            <input type="checkbox" name="audio" value="1" defaultChecked={filters.hasAudio} />
            With audio
          </label>
          <label>
            <input
              type="checkbox"
              name="examples"
              value="1"
              defaultChecked={filters.hasExamples}
            />
            With examples
          </label>
          <label>
            <input
              type="checkbox"
              name="cultural"
              value="1"
              defaultChecked={filters.hasCulturalNotes}
            />
            With cultural notes
          </label>
          <label>
            <input
              type="checkbox"
              name="featured"
              value="1"
              defaultChecked={filters.featured}
            />
            Featured
          </label>
          <label>
            <input type="checkbox" name="recent" value="1" defaultChecked={filters.recent} />
            Recently added
          </label>
        </fieldset>
        <div className="dict-filters__actions">
          <button type="submit" className="btn btn--primary btn--md">
            Apply filters
          </button>
          <Link href="/dictionary" className="btn btn--soft btn--md">
            Clear
          </Link>
        </div>
      </form>

      <div className="dict-page__toolbar">
        <p>
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
        <Link href="/dictionary/favourites" className="text-link">
          View favourites
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state" role="status">
          <h2>No matching approved entries</h2>
          <p>Try another spelling, clear filters, or explore the alphabet.</p>
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
