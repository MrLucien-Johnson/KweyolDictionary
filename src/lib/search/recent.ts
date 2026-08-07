const DEFAULT_KEY = "kweyol-recent-searches-v1";
const MAX_RECENT = 8;

function storageKey(scope?: string) {
  if (!scope || scope === "adult") return DEFAULT_KEY;
  return `kweyol-recent-searches-${scope}-v1`;
}

export function getRecentSearches(scope?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
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

export function pushRecentSearch(query: string, scope?: string): string[] {
  const cleaned = query.trim();
  if (cleaned.length < 2) return getRecentSearches(scope);
  const next = [
    cleaned,
    ...getRecentSearches(scope).filter(
      (item) => item.toLowerCase() !== cleaned.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT);
  window.localStorage.setItem(storageKey(scope), JSON.stringify(next));
  return next;
}

export function clearRecentSearches(scope?: string) {
  window.localStorage.removeItem(storageKey(scope));
}
