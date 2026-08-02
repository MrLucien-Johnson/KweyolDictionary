const STORAGE_KEY = "kweyol-favourites-v1";

export function getFavouriteSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function setFavouriteSlugs(slugs: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(slugs)]));
}

export function toggleFavouriteSlug(slug: string): string[] {
  const current = getFavouriteSlugs();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];
  setFavouriteSlugs(next);
  return next;
}

export function getOrCreateClientKey(): string {
  const keyName = "kweyol-client-key";
  const existing = window.localStorage.getItem(keyName);
  if (existing) return existing;
  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `client-${Date.now()}`;
  window.localStorage.setItem(keyName, created);
  return created;
}
