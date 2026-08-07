const STORAGE_KEY = "kweyol-recent-searches-v1";
const MAX_RECENT = 8;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): string[] {
  const cleaned = query.trim();
  if (cleaned.length < 2) return getRecentSearches();
  const next = [
    cleaned,
    ...getRecentSearches().filter(
      (item) => item.toLowerCase() !== cleaned.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearRecentSearches() {
  window.localStorage.removeItem(STORAGE_KEY);
}
