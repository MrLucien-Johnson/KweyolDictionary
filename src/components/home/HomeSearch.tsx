"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { buildDictionaryHref } from "@/lib/dictionary/filter-url";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildDictionaryHref({}, { q: query.trim() || undefined }));
  }

  return (
    <form className="home-search" role="search" onSubmit={onSubmit}>
      <label htmlFor="home-search-input" className="sr-only">
        Search the adult Kwéyòl–English dictionary
      </label>
      <input
        id="home-search-input"
        name="q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Kwéyòl or English…"
        className="home-search__input"
        autoComplete="off"
      />
      <button type="submit" className="btn btn--primary btn--md">
        Search
      </button>
    </form>
  );
}
