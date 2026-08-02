/**
 * Normalize Kwéyòl / English text for tolerant search matching.
 * Handles accents, apostrophes, and basic whitespace/case differences.
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`´]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Build a slug from a Kwéyòl headword. */
export function slugifyKweyol(word: string): string {
  return normalizeSearchText(word)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
