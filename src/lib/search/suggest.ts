import { getRelationsForSlug, RELATION_LABELS, type WordRelationKind } from "@/data/word-relations";
import type { PublishedEntry } from "@/lib/content/types";
import {
  levenshtein,
  maxTypoDistance,
  similarityRatio,
} from "@/lib/search/fuzzy";
import { normalizeSearchText } from "@/lib/search/normalize";

export type MatchKind =
  | "exact"
  | "prefix"
  | "contains"
  | "english"
  | "fuzzy"
  | "related";

export type SearchSuggestion = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  partOfSpeech: string;
  matchKind: MatchKind;
  score: number;
};

export type DidYouMeanSuggestion = SearchSuggestion & {
  distance: number;
};

export type RelatedSuggestion = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  partOfSpeech: string;
  kind: WordRelationKind;
  label: string;
  /** Entry the relationship is anchored to (usually a direct search hit). */
  viaSlug: string;
  viaKweyolWord: string;
};

type ScoredField = {
  field: string;
  weight: number;
};

function entryFields(entry: PublishedEntry): ScoredField[] {
  return [
    { field: normalizeSearchText(entry.kweyolWord), weight: 100 },
    { field: normalizeSearchText(entry.slug.replace(/-/g, " ")), weight: 70 },
    { field: normalizeSearchText(entry.englishTranslation), weight: 85 },
    {
      field: normalizeSearchText(entry.alternativeEnglish ?? ""),
      weight: 70,
    },
    {
      field: normalizeSearchText(entry.alternativeSpelling ?? ""),
      weight: 80,
    },
  ].filter((row) => row.field.length > 0);
}

function scoreEntry(entry: PublishedEntry, needle: string): SearchSuggestion | null {
  if (!needle) return null;

  let bestScore = -1;
  let matchKind: MatchKind = "contains";

  for (const { field, weight } of entryFields(entry)) {
    if (field === needle) {
      const score = weight + 40;
      if (score > bestScore) {
        bestScore = score;
        matchKind = field === normalizeSearchText(entry.kweyolWord) ? "exact" : "english";
      }
      continue;
    }

    if (field.startsWith(needle)) {
      const score = weight + 25 - Math.min(field.length - needle.length, 12);
      if (score > bestScore) {
        bestScore = score;
        matchKind =
          field === normalizeSearchText(entry.kweyolWord) ||
          field === normalizeSearchText(entry.alternativeSpelling ?? "")
            ? "prefix"
            : "english";
      }
      continue;
    }

    // Prefer whole-token contains for short needles so "wi" does not
    // flood matches inside longer words like "kabwit".
    const tokenHit =
      needle.length <= 2
        ? field.split(" ").includes(needle)
        : field.includes(needle);
    if (tokenHit) {
      const score =
        weight -
        5 -
        (field.split(" ").includes(needle) ? 0 : field.indexOf(needle));
      if (score > bestScore) {
        bestScore = score;
        matchKind =
          normalizeSearchText(entry.englishTranslation)
            .split(/[\s/,]+/)
            .includes(needle) ||
          normalizeSearchText(entry.alternativeEnglish ?? "")
            .split(/[\s/,]+/)
            .includes(needle) ||
          normalizeSearchText(entry.englishTranslation).includes(needle)
            ? "english"
            : "contains";
      }
      continue;
    }

    if (needle.length >= 2 && field.length <= 24) {
      const distance = levenshtein(needle, field);
      const allowed = maxTypoDistance(needle.length);
      // Keep fuzzy suggestions tight for short queries.
      if (
        distance > 0 &&
        distance <= allowed &&
        (needle.length >= 4 || distance === 1)
      ) {
        const ratio = similarityRatio(needle, field);
        const score = weight * ratio - distance * 8;
        if (score > bestScore) {
          bestScore = score;
          matchKind = "fuzzy";
        }
      }
    }
  }

  if (bestScore < 0) return null;

  return {
    slug: entry.slug,
    kweyolWord: entry.kweyolWord,
    englishTranslation: entry.englishTranslation,
    partOfSpeech: entry.partOfSpeech,
    matchKind,
    score: bestScore,
  };
}

function toSuggestion(
  entry: PublishedEntry,
  matchKind: MatchKind,
  score: number,
): SearchSuggestion {
  return {
    slug: entry.slug,
    kweyolWord: entry.kweyolWord,
    englishTranslation: entry.englishTranslation,
    partOfSpeech: entry.partOfSpeech,
    matchKind,
    score,
  };
}

/** Predictive / autocomplete suggestions as the user types. */
export function suggestEntries(
  query: string,
  entries: PublishedEntry[],
  limit = 8,
): SearchSuggestion[] {
  const needle = normalizeSearchText(query);
  if (needle.length < 1) return [];

  const scored: SearchSuggestion[] = [];
  for (const entry of entries) {
    const hit = scoreEntry(entry, needle);
    if (hit) scored.push(hit);
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.kweyolWord.localeCompare(b.kweyolWord, undefined, {
          sensitivity: "base",
        }),
    )
    .slice(0, limit);
}

/**
 * Spell-check style correction when the query looks mistyped.
 * Returns null when an exact / strong substring match already exists.
 */
export function didYouMean(
  query: string,
  entries: PublishedEntry[],
): DidYouMeanSuggestion | null {
  const needle = normalizeSearchText(query);
  if (needle.length < 2) return null;

  const hasStrongMatch = entries.some((entry) => {
    const fields = entryFields(entry).map((row) => row.field);
    return fields.some(
      (field) =>
        field === needle ||
        field.startsWith(needle) ||
        (needle.length >= 3 && field.includes(needle)),
    );
  });
  if (hasStrongMatch) return null;

  const allowed = maxTypoDistance(needle.length);
  let best: DidYouMeanSuggestion | null = null;

  for (const entry of entries) {
    const candidates = [
      normalizeSearchText(entry.kweyolWord),
      normalizeSearchText(entry.englishTranslation),
      normalizeSearchText(entry.alternativeSpelling ?? ""),
    ].filter(Boolean);

    for (const field of candidates) {
      if (Math.abs(field.length - needle.length) > allowed) continue;
      const distance = levenshtein(needle, field);
      if (distance === 0 || distance > allowed) continue;
      const ratio = similarityRatio(needle, field);
      if (ratio < 0.55) continue;
      const score = ratio * 100 - distance * 10;
      if (!best || score > best.score) {
        best = {
          ...toSuggestion(
            entry,
            field === normalizeSearchText(entry.englishTranslation)
              ? "english"
              : "fuzzy",
            score,
          ),
          distance,
        };
      }
    }
  }

  return best;
}

/** Similar-looking or closely fuzzy-matching words for a query. */
export function findSimilarEntries(
  query: string,
  entries: PublishedEntry[],
  options?: { limit?: number; excludeSlugs?: Iterable<string> },
): SearchSuggestion[] {
  const needle = normalizeSearchText(query);
  if (needle.length < 2) return [];

  const exclude = new Set(options?.excludeSlugs ?? []);
  const limit = options?.limit ?? 6;
  const allowed = maxTypoDistance(Math.max(needle.length, 3));
  const scored: SearchSuggestion[] = [];

  for (const entry of entries) {
    if (exclude.has(entry.slug)) continue;
    const kw = normalizeSearchText(entry.kweyolWord);
    const en = normalizeSearchText(entry.englishTranslation);
    const alt = normalizeSearchText(entry.alternativeSpelling ?? "");

    let bestDistance = Infinity;
    let bestField = kw;
    for (const field of [kw, en, alt].filter(Boolean)) {
      const distance = levenshtein(needle, field);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestField = field;
      }
      if (field.startsWith(needle) || needle.startsWith(field.slice(0, needle.length))) {
        bestDistance = Math.min(bestDistance, 1);
        bestField = field;
      }
    }

    if (bestDistance > allowed && !en.includes(needle) && !kw.includes(needle)) {
      continue;
    }

    const ratio = similarityRatio(needle, bestField);
    if (ratio < 0.4 && bestDistance > 1) continue;

    scored.push({
      ...toSuggestion(entry, bestDistance <= 1 ? "prefix" : "fuzzy", ratio * 100 - bestDistance * 5),
    });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.kweyolWord.localeCompare(b.kweyolWord))
    .slice(0, limit);
}

/**
 * Best anchors for related-word lookups: prefer ranked suggestions
 * (exact / prefix / English) over incidental substring hits.
 */
export function findAnchorEntries(
  query: string,
  entries: PublishedEntry[],
  limit = 6,
): PublishedEntry[] {
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const ranked = suggestEntries(query, entries, limit * 2);
  const anchors: PublishedEntry[] = [];
  const seen = new Set<string>();

  for (const hit of ranked) {
    // Skip weak fuzzy-only anchors when stronger matches exist.
    if (
      hit.matchKind === "fuzzy" &&
      ranked.some((row) => row.matchKind !== "fuzzy")
    ) {
      continue;
    }
    const entry = bySlug.get(hit.slug);
    if (!entry || seen.has(entry.slug)) continue;
    seen.add(entry.slug);
    anchors.push(entry);
    if (anchors.length >= limit) break;
  }

  if (!anchors.length) {
    const correction = didYouMean(query, entries);
    if (correction) {
      const entry = bySlug.get(correction.slug);
      if (entry) anchors.push(entry);
    }
  }

  return anchors;
}

/** Antonyms / synonyms / variants for entries matching the query. */
export function findRelatedForQuery(
  query: string,
  entries: PublishedEntry[],
  limit = 8,
): RelatedSuggestion[] {
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const anchors = findAnchorEntries(query, entries, 6);

  const seen = new Set<string>();
  const results: RelatedSuggestion[] = [];
  const kindOrder: WordRelationKind[] = [
    "antonym",
    "synonym",
    "variant",
    "related",
  ];

  for (const kind of kindOrder) {
    for (const anchor of anchors) {
      for (const relation of getRelationsForSlug(anchor.slug)) {
        if (relation.kind !== kind) continue;
        const key = `${relation.kind}:${relation.slug}`;
        if (seen.has(key) || relation.slug === anchor.slug) continue;
        const target = bySlug.get(relation.slug);
        if (!target) continue;
        seen.add(key);
        results.push({
          slug: target.slug,
          kweyolWord: target.kweyolWord,
          englishTranslation: target.englishTranslation,
          partOfSpeech: target.partOfSpeech,
          kind: relation.kind,
          label: relation.label,
          viaSlug: anchor.slug,
          viaKweyolWord: anchor.kweyolWord,
        });
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

export function getLabeledRelationsForEntry(
  entry: PublishedEntry,
  catalog: PublishedEntry[],
): RelatedSuggestion[] {
  const bySlug = new Map(catalog.map((row) => [row.slug, row]));
  const results: RelatedSuggestion[] = [];

  for (const relation of getRelationsForSlug(entry.slug)) {
    const target = bySlug.get(relation.slug);
    if (!target) continue;
    results.push({
      slug: target.slug,
      kweyolWord: target.kweyolWord,
      englishTranslation: target.englishTranslation,
      partOfSpeech: target.partOfSpeech,
      kind: relation.kind,
      label: relation.label,
      viaSlug: entry.slug,
      viaKweyolWord: entry.kweyolWord,
    });
  }

  return results.sort((a, b) => a.label.localeCompare(b.label) || a.kweyolWord.localeCompare(b.kweyolWord));
}

export function matchKindLabel(kind: MatchKind): string {
  switch (kind) {
    case "exact":
      return "Exact match";
    case "prefix":
      return "Starts with";
    case "contains":
      return "Contains";
    case "english":
      return "English match";
    case "fuzzy":
      return "Close spelling";
    case "related":
      return RELATION_LABELS.related;
    default:
      return "Match";
  }
}
