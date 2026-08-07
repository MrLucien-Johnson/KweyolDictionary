"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchSuggest } from "@/components/dictionary/SearchSuggest";
import { listChildEntries } from "@/lib/content/catalog";
import { pushRecentSearch } from "@/lib/search/recent";

type ChildrenSearchProps = {
  id?: string;
  /** When true, selecting a word opens the child word page. */
  navigateOnSelect?: boolean;
  /** Called when the user submits a search query (not a direct word pick). */
  onSubmitQuery?: (query: string) => void;
  formClassName?: string;
  inputClassName?: string;
  initialQuery?: string;
};

export function ChildrenSearch({
  id = "children-search",
  navigateOnSelect = true,
  onSubmitQuery,
  formClassName = "children-search",
  inputClassName = "children-search__input",
  initialQuery = "",
}: ChildrenSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const entries = useMemo(
    () =>
      listChildEntries().map((entry) => ({
        ...entry,
        englishTranslation:
          entry.childPresentation?.simpleMeaning ?? entry.englishTranslation,
      })),
    [],
  );

  function goSearch(next: string) {
    const trimmed = next.trim();
    if (trimmed) pushRecentSearch(trimmed, "children");
    if (onSubmitQuery) {
      onSubmitQuery(trimmed);
      return;
    }
    router.push(
      trimmed
        ? `/children/words/?q=${encodeURIComponent(trimmed)}`
        : "/children/words/",
    );
  }

  return (
    <SearchSuggest
      id={id}
      value={query}
      onChange={setQuery}
      onSubmitQuery={goSearch}
      onSelectRecent={goSearch}
      entries={entries}
      recentScope="children"
      navigateOnSelect={navigateOnSelect}
      getResultHref={(slug) => `/children/words/${slug}/`}
      buildSearchAllHref={(q) =>
        `/children/words/?q=${encodeURIComponent(q)}`
      }
      placeholder="Find a picture word…"
      formClassName={formClassName}
      inputClassName={inputClassName}
      submitLabel="Find"
    />
  );
}
