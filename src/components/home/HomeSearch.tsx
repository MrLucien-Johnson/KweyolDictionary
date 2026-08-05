"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchSuggest } from "@/components/dictionary/SearchSuggest";
import { buildDictionaryHref } from "@/lib/dictionary/filter-url";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <SearchSuggest
      id="home-search-input"
      value={query}
      onChange={setQuery}
      onSubmitQuery={(next) => {
        router.push(buildDictionaryHref({}, { q: next.trim() || undefined }));
      }}
      formClassName="home-search"
      inputClassName="home-search__input"
    />
  );
}
