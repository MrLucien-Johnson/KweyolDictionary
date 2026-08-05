"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { listEntries } from "@/lib/content/catalog";
import {
  matchKindLabel,
  suggestEntries,
  type SearchSuggestion,
} from "@/lib/search/suggest";
import { withBasePath } from "@/lib/dictionary/filter-url";

type SearchSuggestProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSubmitQuery: (query: string) => void;
  placeholder?: string;
  inputClassName?: string;
  formClassName?: string;
  /** When true, choosing a suggestion navigates to the word page. */
  navigateOnSelect?: boolean;
  /** Called when a suggestion is chosen (after optional navigation). */
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  submitLabel?: string;
};

export function SearchSuggest({
  id,
  value,
  onChange,
  onSubmitQuery,
  placeholder = "Search Kwéyòl or English…",
  inputClassName,
  formClassName,
  navigateOnSelect = true,
  onSelectSuggestion,
  submitLabel = "Search",
}: SearchSuggestProps) {
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const catalog = useMemo(() => listEntries({}), []);
  const suggestions = useMemo(
    () => suggestEntries(value, catalog, 8),
    [catalog, value],
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const showList = open && value.trim().length >= 1 && suggestions.length > 0;

  function chooseSuggestion(suggestion: SearchSuggestion) {
    onChange(suggestion.kweyolWord);
    setOpen(false);
    onSelectSuggestion?.(suggestion);
    if (navigateOnSelect) {
      window.location.assign(withBasePath(`/dictionary/${suggestion.slug}/`));
      return;
    }
    onSubmitQuery(suggestion.kweyolWord);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    setOpen(false);
    onSubmitQuery(query);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) chooseSuggestion(suggestion);
    }
  }

  return (
    <form
      ref={rootRef}
      className={formClassName}
      role="search"
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor={id}>
        Search Kwéyòl or English
      </label>
      <div className="search-suggest">
        <input
          id={id}
          name="q"
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={inputClassName}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
        />
        {showList ? (
          <ul
            id={listId}
            className="search-suggest__list"
            role="listbox"
            aria-label="Predicted matches"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.slug}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={
                  index === activeIndex
                    ? "search-suggest__option is-active"
                    : "search-suggest__option"
                }
              >
                <button
                  type="button"
                  className="search-suggest__option-btn"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => chooseSuggestion(suggestion)}
                >
                  <span className="search-suggest__word">
                    {suggestion.kweyolWord}
                  </span>
                  <span className="search-suggest__english">
                    {suggestion.englishTranslation}
                  </span>
                  <span className="search-suggest__meta">
                    {matchKindLabel(suggestion.matchKind)}
                    {suggestion.partOfSpeech
                      ? ` · ${suggestion.partOfSpeech}`
                      : ""}
                  </span>
                </button>
              </li>
            ))}
            <li className="search-suggest__footer">
              <Link
                href={`/dictionary/?q=${encodeURIComponent(value.trim())}`}
                className="search-suggest__search-all"
                onClick={() => setOpen(false)}
              >
                Search all results for “{value.trim()}”
              </Link>
            </li>
          </ul>
        ) : null}
      </div>
      <button type="submit" className="btn btn--primary btn--md">
        {submitLabel}
      </button>
    </form>
  );
}
