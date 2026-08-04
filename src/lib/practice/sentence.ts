import { normalizeSearchText } from "@/lib/search/normalize";

/**
 * Split a Kwéyòl sentence into playable tiles.
 * Keeps hyphenated forms (jòdi-a, mango-a) as one tile.
 */
export function tokenizeSentence(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed.match(
    /[\p{L}\p{M}0-9]+(?:['’-][\p{L}\p{M}0-9]+)*|[^\s\p{L}\p{M}0-9]+/gu,
  );
  return (parts ?? []).map((part) => part.trim()).filter(Boolean);
}

export function joinTokens(tokens: string[]): string {
  return tokens.reduce((sentence, token, index) => {
    if (index === 0) return token;
    if (/^[.,!?;:…]/.test(token)) return `${sentence}${token}`;
    return `${sentence} ${token}`;
  }, "");
}

function stripEdgePunctuation(token: string) {
  return token.replace(
    /^[^\p{L}\p{M}0-9]+|[^\p{L}\p{M}0-9]+$/gu,
    "",
  );
}

/** Find the token index that matches the headword (accent/case tolerant). */
export function findHeadwordTokenIndex(
  tokens: string[],
  headword: string,
): number {
  const needle = normalizeSearchText(headword);
  if (!needle) return -1;

  const exact = tokens.findIndex(
    (token) => normalizeSearchText(stripEdgePunctuation(token)) === needle,
  );
  if (exact >= 0) return exact;

  // Allow hyphenated definite forms: mango-a for mango
  return tokens.findIndex((token) => {
    const cleaned = normalizeSearchText(stripEdgePunctuation(token));
    return cleaned === `${needle}a` || cleaned.startsWith(`${needle}-`);
  });
}

export function shuffleInPlace<T>(items: T[], random = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function pickDistractors(
  correct: string,
  pool: string[],
  count: number,
): string[] {
  const seen = new Set<string>([normalizeSearchText(correct)]);
  const distractors: string[] = [];
  for (const candidate of shuffleInPlace([...pool])) {
    const key = normalizeSearchText(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    distractors.push(candidate);
    if (distractors.length >= count) break;
  }
  return distractors;
}
