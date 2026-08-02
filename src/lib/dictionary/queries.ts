import {
  getAdjacent,
  getEntry,
  getPartsOfSpeech,
  getWordOfTheDay,
  listAdultCategories,
  listEntries,
  type CatalogListFilters,
} from "@/lib/content/catalog";

export type DictionaryListFilters = CatalogListFilters & {
  includeDrafts?: boolean;
};

export async function listDictionaryEntries(filters: DictionaryListFilters = {}) {
  // Public site always uses published approved catalog (Pages + local public UI).
  void filters.includeDrafts;
  return listEntries(filters);
}

export async function getEntryBySlug(slug: string) {
  const entry = getEntry(slug);
  if (!entry) return null;
  return {
    ...entry,
    synonyms: [] as { toEntry: { id: string; slug: string; kweyolWord: string; englishTranslation: string; reviewStatus: string } }[],
    relatedFrom: [] as { fromEntry: { id: string; slug: string; kweyolWord: string; englishTranslation: string; reviewStatus: string } }[],
  };
}

export async function getAdjacentEntries(slug: string) {
  const { previous, next } = getAdjacent(slug);
  return {
    previous: previous ? { slug: previous.slug, kweyolWord: previous.kweyolWord } : null,
    next: next ? { slug: next.slug, kweyolWord: next.kweyolWord } : null,
  };
}

export async function getWordOfTheDayEntry() {
  return getWordOfTheDay();
}

export async function getFeaturedEntries(limit = 6) {
  return listEntries({ featured: true }).slice(0, limit);
}

export async function getRecentEntries(limit = 8) {
  return listEntries({ recent: true }).slice(0, limit);
}

export async function getPartsOfSpeechList() {
  return getPartsOfSpeech();
}

export async function getPublicCategories() {
  return listAdultCategories().map((category, index) => ({
    id: category.key,
    key: category.key,
    nameEn: category.nameEn,
    sortOrder: index,
  }));
}

// Back-compat aliases used by older imports
export { getWordOfTheDayEntry as getWordOfTheDay };
export { getPartsOfSpeechList as getPartsOfSpeech };
