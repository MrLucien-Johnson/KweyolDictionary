"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Flashcards } from "@/components/learning/Flashcards";
import { listEntries } from "@/lib/content/catalog";
import { getFavouriteSlugs } from "@/lib/favourites/storage";

type Card = {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
};

type FlashcardsClientProps = {
  defaultCards: Card[];
};

function shuffleCards(cards: Card[]) {
  const next = [...cards];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

export function FlashcardsClient({ defaultCards }: FlashcardsClientProps) {
  const searchParams = useSearchParams();
  const usingFavourites = searchParams.get("deck") === "favourites";
  const deckKey = usingFavourites ? "favourites" : "beginner";
  const [favouriteCards, setFavouriteCards] = useState<Card[]>([]);
  const [loadedDeck, setLoadedDeck] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      if (!usingFavourites) {
        setLoadedDeck("beginner");
        return;
      }
      const slugs = new Set(getFavouriteSlugs());
      const cards = listEntries({})
        .filter((entry) => slugs.has(entry.slug))
        .map((entry) => ({
          id: entry.id,
          front: entry.kweyolWord,
          back: entry.englishTranslation,
          hint: entry.pronunciationGuide,
        }));
      setFavouriteCards(shuffleCards(cards));
      setLoadedDeck("favourites");
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [usingFavourites]);

  const ready = loadedDeck === deckKey;
  const cards = useMemo(() => {
    if (usingFavourites) return favouriteCards;
    return defaultCards;
  }, [defaultCards, favouriteCards, usingFavourites]);

  return (
    <div className="flashcards-deck">
      <div className="flashcards-deck__switch" role="navigation" aria-label="Flashcard deck">
        <Link
          href="/learn/flashcards"
          className={
            usingFavourites
              ? "flashcards-deck__link"
              : "flashcards-deck__link is-current"
          }
        >
          Beginner deck
        </Link>
        <Link
          href="/learn/flashcards?deck=favourites"
          className={
            usingFavourites
              ? "flashcards-deck__link is-current"
              : "flashcards-deck__link"
          }
        >
          Favourites deck
        </Link>
      </div>

      {!ready ? (
        <p className="loading-line">Loading flashcards…</p>
      ) : usingFavourites && favouriteCards.length === 0 ? (
        <div className="empty-state">
          <h2>No favourites to study yet</h2>
          <p>Save words from the dictionary, then return here to flashcard them.</p>
          <Link href="/dictionary/" className="btn btn--primary btn--md">
            Browse dictionary
          </Link>
        </div>
      ) : (
        <Flashcards key={usingFavourites ? "favourites" : "beginner"} cards={cards} />
      )}
    </div>
  );
}
