"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuBox, setMenuBox] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const catalog = useMemo(() => listEntries({}), []);
  const suggestions = useMemo(
    () => suggestEntries(value, catalog, 8),
    [catalog, value],
  );

  const showList = open && value.trim().length >= 1 && suggestions.length > 0;

  useLayoutEffect(() => {
    if (!showList) return;

    function updatePosition() {
      const input = inputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      setMenuBox({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showList, value, suggestions.length]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

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

  const listbox =
    showList && menuBox && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            className="search-suggest__list search-suggest__list--portal"
            role="listbox"
            aria-label="Predicted matches"
            style={{
              top: menuBox.top,
              left: menuBox.left,
              width: menuBox.width,
            }}
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
          </ul>,
          document.body,
        )
      : null;

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
          ref={inputRef}
          id={id}
          name="q"
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setActiveIndex(-1);
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
        {listbox}
      </div>
      <button type="submit" className="btn btn--primary btn--md">
        {submitLabel}
      </button>
    </form>
  );
}
