/** Classic Levenshtein edit distance (insert / delete / substitute). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j]! + 1,
        curr[j - 1]! + 1,
        prev[j - 1]! + cost,
      );
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j]!;
  }

  return prev[b.length]!;
}

/** 0–1 similarity from edit distance (1 = identical). */
export function similarityRatio(a: string, b: string): number {
  if (!a && !b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (!maxLen) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/** Max edit distance we still treat as a plausible typo for this query length. */
export function maxTypoDistance(queryLength: number): number {
  if (queryLength <= 2) return 1;
  if (queryLength <= 5) return 2;
  return 3;
}
