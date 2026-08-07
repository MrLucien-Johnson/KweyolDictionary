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
import {
  getRecentSearches,
  pushRecentSearch,
} from "@/lib/search/recent";
import { withBasePath } from "@/lib/dictionary/filter-url";

const COMPACT_QUERY = "(max-width: 720px)";

type MenuBox = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "below" | "above";
};

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
  /** Called when a recent search chip is chosen. */
  onSelectRecent?: (query: string) => void;
  /** Prefer English-oriented placeholder copy. */
  englishFirst?: boolean;
  submitLabel?: string;
};

function useCompactViewport() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return compact;
}

function viewportMetrics() {
  const visual = window.visualViewport;
  if (visual) {
    return {
      top: visual.offsetTop,
      height: visual.height,
      width: visual.width,
    };
  }
  return {
    top: 0,
    height: window.innerHeight,
    width: window.innerWidth,
  };
}

export function SearchSuggest({
  id,
  value,
  onChange,
  onSubmitQuery,
  placeholder,
  inputClassName,
  formClassName,
  navigateOnSelect = true,
  onSelectSuggestion,
  onSelectRecent,
  englishFirst = false,
  submitLabel = "Search",
}: SearchSuggestProps) {
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuBox, setMenuBox] = useState<MenuBox | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const compact = useCompactViewport();
  const resolvedPlaceholder =
    placeholder ??
    (englishFirst
      ? "Search English meaning or Kwéyòl…"
      : "Search Kwéyòl or English…");

  const catalog = useMemo(() => listEntries({}), []);
  const suggestionLimit = compact ? 5 : 8;
  const suggestions = useMemo(
    () => suggestEntries(value, catalog, suggestionLimit),
    [catalog, suggestionLimit, value],
  );

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setRecent(getRecentSearches());
    });
    return () => cancelAnimationFrame(frame);
  }, [open, value]);

  const showList = open && value.trim().length >= 1 && suggestions.length > 0;
  const showRecent = open && value.trim().length === 0 && recent.length > 0;
  // On small screens, keep the list in document flow so it never covers the field
  // (fixed portals + soft keyboards often overlap the focused input).
  const usePortal = showList && !compact;

  useLayoutEffect(() => {
    if (!showList) return;

    function updatePosition() {
      const input = inputRef.current;
      if (!input) return;

      if (compact) {
        // In-flow list: only need a compact max-height; no fixed coordinates.
        const view = viewportMetrics();
        const rect = input.getBoundingClientRect();
        const spaceBelow = Math.max(
          120,
          view.top + view.height - rect.bottom - 16,
        );
        setMenuBox({
          left: 0,
          width: rect.width,
          maxHeight: Math.min(spaceBelow, view.height * 0.42),
          placement: "below",
        });
        return;
      }

      const view = viewportMetrics();
      const rect = input.getBoundingClientRect();
      const gap = 6;
      const spaceBelow = view.top + view.height - rect.bottom - gap - 12;
      const spaceAbove = rect.top - view.top - gap - 12;
      const placeAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(
        120,
        Math.min(placeAbove ? spaceAbove : spaceBelow, view.height * 0.55),
      );
      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - Math.min(rect.width, view.width - 16) - 8),
      );
      const width = Math.min(rect.width, view.width - 16);

      if (placeAbove) {
        setMenuBox({
          bottom: Math.max(8, window.innerHeight - rect.top + gap),
          left,
          width,
          maxHeight,
          placement: "above",
        });
        return;
      }

      setMenuBox({
        top: rect.bottom + gap,
        left,
        width,
        maxHeight,
        placement: "below",
      });
    }

    updatePosition();

    if (compact) {
      // Keep the field visible above the in-flow suggestions + keyboard.
      inputRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [showList, compact, value, suggestions.length]);

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
    pushRecentSearch(suggestion.kweyolWord);
    setOpen(false);
    onSelectSuggestion?.(suggestion);
    if (navigateOnSelect) {
      window.location.assign(withBasePath(`/dictionary/${suggestion.slug}/`));
      return;
    }
    onSubmitQuery(suggestion.kweyolWord);
  }

  function chooseRecent(query: string) {
    onChange(query);
    pushRecentSearch(query);
    setOpen(false);
    if (onSelectRecent) {
      onSelectRecent(query);
      return;
    }
    onSubmitQuery(query);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (query) pushRecentSearch(query);
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

  const listClassName = [
    "search-suggest__list",
    usePortal ? "search-suggest__list--portal" : "search-suggest__list--inline",
    menuBox?.placement === "above" ? "is-above" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const listStyle = usePortal
    ? {
        top: menuBox?.top,
        bottom: menuBox?.bottom,
        left: menuBox?.left,
        width: menuBox?.width,
        maxHeight: menuBox?.maxHeight,
      }
    : {
        maxHeight: menuBox?.maxHeight ?? "42vh",
      };

  const listbox =
    showList && (compact || menuBox) ? (
      <ul
        ref={listRef}
        id={listId}
        className={listClassName}
        role="listbox"
        aria-label="Predicted matches"
        style={listStyle}
      >
        {compact ? (
          <li className="search-suggest__toolbar">
            <span className="search-suggest__toolbar-label">Suggestions</span>
            <button
              type="button"
              className="search-suggest__dismiss"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </li>
        ) : null}
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
    ) : null;

  const portaledListbox =
    usePortal && listbox && typeof document !== "undefined"
      ? createPortal(listbox, document.body)
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
      <div
        className={
          showList && compact
            ? "search-suggest search-suggest--open-inline"
            : "search-suggest"
        }
      >
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
          placeholder={resolvedPlaceholder}
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
        {showRecent ? (
          <div className="search-suggest__recent" aria-label="Recent searches">
            <span className="search-suggest__recent-label">Recent</span>
            <div className="search-suggest__recent-chips">
              {recent.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="search-suggest__recent-chip"
                  onClick={() => chooseRecent(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {compact ? listbox : portaledListbox}
      </div>
      <button type="submit" className="btn btn--primary btn--md">
        {submitLabel}
      </button>
    </form>
  );
}
