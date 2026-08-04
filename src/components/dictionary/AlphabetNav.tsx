import {
  buildDictionaryHref,
  type DictionaryFilterState,
} from "@/lib/dictionary/filter-url";
import { DictionaryFilterLink } from "@/components/dictionary/DictionaryFilterLink";

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
      <DictionaryFilterLink
        href={buildDictionaryHref(currentFilters, { letter: undefined })}
        className={!activeLetter ? "alphabet-nav__link is-active" : "alphabet-nav__link"}
      >
        All
      </DictionaryFilterLink>
      {LETTERS.map((letter) => {
        const active = activeLetter?.toUpperCase() === letter;
        return (
          <DictionaryFilterLink
            key={letter}
            href={
              active
                ? buildDictionaryHref(currentFilters, { letter: undefined })
                : buildDictionaryHref(currentFilters, {
                    letter: letter.toLowerCase(),
                  })
            }
            className={active ? "alphabet-nav__link is-active" : "alphabet-nav__link"}
            aria-current={active ? "page" : undefined}
          >
            {letter}
          </DictionaryFilterLink>
        );
      })}
    </nav>
  );
}
