"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchSuggest } from "@/components/dictionary/SearchSuggest";
import { buildDictionaryHref } from "@/lib/dictionary/filter-url";
import { pushRecentSearch } from "@/lib/search/recent";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function goSearch(next: string) {
    const trimmed = next.trim();
    if (trimmed) pushRecentSearch(trimmed);
    router.push(buildDictionaryHref({}, { q: trimmed || undefined }));
  }

  return (
    <SearchSuggest
      id="home-search-input"
      value={query}
      onChange={setQuery}
      onSubmitQuery={goSearch}
      onSelectRecent={goSearch}
      formClassName="home-search"
      inputClassName="home-search__input"
    />
  );
}
