export type DictionaryFilterState = {
  q?: string;
  letter?: string;
  partOfSpeech?: string;
  category?: string;
  difficulty?: string;
  hasAudio?: boolean;
  hasExamples?: boolean;
  hasCulturalNotes?: boolean;
  featured?: boolean;
  recent?: boolean;
  /** Prefer English gloss matching / sorting for English-first lookups. */
  mode?: "en";
};

/** Path always uses a trailing slash so GitHub Pages static export matches. */
export function buildDictionaryHref(
  current: DictionaryFilterState,
  patch: Partial<DictionaryFilterState> = {},
) {
  const merged: DictionaryFilterState = { ...current, ...patch };

  // Explicit nullish clears via empty string / false in patch
  for (const key of Object.keys(patch) as (keyof DictionaryFilterState)[]) {
    const value = patch[key];
    if (value === "" || value === false || value == null) {
      delete merged[key];
    }
  }

  // Drop falsey booleans left over from readFilters spreads
  for (const key of Object.keys(merged) as (keyof DictionaryFilterState)[]) {
    const value = merged[key];
    if (value === "" || value === false || value == null) {
      delete merged[key];
    }
  }

  const params = new URLSearchParams();
  if (merged.q?.trim()) params.set("q", merged.q.trim());
  if (merged.letter) params.set("letter", merged.letter.toLowerCase());
  if (merged.partOfSpeech) params.set("pos", merged.partOfSpeech);
  if (merged.category) params.set("category", merged.category);
  if (merged.difficulty) params.set("difficulty", merged.difficulty);
  if (merged.hasAudio) params.set("audio", "1");
  if (merged.hasExamples) params.set("examples", "1");
  if (merged.hasCulturalNotes) params.set("cultural", "1");
  if (merged.featured) params.set("featured", "1");
  if (merged.recent) params.set("recent", "1");
  if (merged.mode === "en") params.set("mode", "en");

  const query = params.toString();
  return query ? `/dictionary/?${query}` : "/dictionary/";
}

export function countActiveDictionaryFilters(filters: DictionaryFilterState) {
  let count = 0;
  if (filters.q?.trim()) count += 1;
  if (filters.letter) count += 1;
  if (filters.partOfSpeech) count += 1;
  if (filters.category) count += 1;
  if (filters.difficulty) count += 1;
  if (filters.hasAudio) count += 1;
  if (filters.hasExamples) count += 1;
  if (filters.hasCulturalNotes) count += 1;
  if (filters.featured) count += 1;
  if (filters.recent) count += 1;
  if (filters.mode === "en") count += 1;
  return count;
}

export function withBasePath(href: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base) return href;
  if (href.startsWith(base + "/") || href === base) return href;
  return `${base}${href.startsWith("/") ? href : `/${href}`}`;
}

/**
 * Static GitHub Pages exports soft-navigate poorly when clearing search
 * params on the same pathname (URL stays stuck). Detect that case so callers
 * can force a real navigation.
 */
export function needsHardDictionaryNavigation(
  currentSearch: string,
  nextHref: string,
) {
  const nextHasQuery = nextHref.includes("?");
  const currentHasQuery = Boolean(currentSearch && currentSearch !== "?");
  return currentHasQuery && !nextHasQuery;
}
