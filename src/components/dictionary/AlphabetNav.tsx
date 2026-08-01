import Link from "next/link";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type AlphabetNavProps = {
  activeLetter?: string;
};

export function AlphabetNav({ activeLetter }: AlphabetNavProps) {
  return (
    <nav className="alphabet-nav" aria-label="Browse by letter">
      <Link
        href="/dictionary"
        className={!activeLetter ? "alphabet-nav__link is-active" : "alphabet-nav__link"}
      >
        All
      </Link>
      {LETTERS.map((letter) => {
        const active = activeLetter?.toUpperCase() === letter;
        return (
          <Link
            key={letter}
            href={`/dictionary?letter=${letter.toLowerCase()}`}
            className={active ? "alphabet-nav__link is-active" : "alphabet-nav__link"}
          >
            {letter}
          </Link>
        );
      })}
    </nav>
  );
}
