import Link from "next/link";
import {
  buildDictionaryHref,
  type DictionaryFilterState,
} from "@/lib/dictionary/filter-url";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type AlphabetNavProps = {
  activeLetter?: string;
  currentFilters?: DictionaryFilterState;
};

export function AlphabetNav({
  activeLetter,
  currentFilters = {},
}: AlphabetNavProps) {
  return (
    <nav className="alphabet-nav" aria-label="Browse by letter">
      <Link
        href={buildDictionaryHref(currentFilters, { letter: undefined })}
        className={!activeLetter ? "alphabet-nav__link is-active" : "alphabet-nav__link"}
      >
        All
      </Link>
      {LETTERS.map((letter) => {
        const active = activeLetter?.toUpperCase() === letter;
        return (
          <Link
            key={letter}
            href={buildDictionaryHref(currentFilters, {
              letter: letter.toLowerCase(),
            })}
            className={active ? "alphabet-nav__link is-active" : "alphabet-nav__link"}
            aria-current={active ? "page" : undefined}
          >
            {letter}
          </Link>
        );
      })}
    </nav>
  );
}
