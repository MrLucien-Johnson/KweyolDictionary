"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    router.push(`/dictionary?${params.toString()}`);
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
