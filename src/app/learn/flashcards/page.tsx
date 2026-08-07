import type { Metadata } from "next";
import { Suspense } from "react";
import { FlashcardsClient } from "@/components/learning/FlashcardsClient";
import { listDictionaryEntries } from "@/lib/dictionary/queries";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Practice approved Dominican Kwéyòl vocabulary with flashcards.",
};

export default async function FlashcardsPage() {
  const entries = await listDictionaryEntries({});
  const cards = entries.slice(0, 24).map((entry) => ({
    id: entry.id,
    front: entry.kweyolWord,
    back: entry.englishTranslation,
    hint: entry.pronunciationGuide,
  }));

  return (
    <div className="learn-page">
      <header className="dict-page__header">
        <h1>Flashcards</h1>
        <p>
          Flip each card, say the word aloud, then reveal the English meaning.
          Switch to your favourites deck anytime.
        </p>
      </header>
      <Suspense fallback={<p className="loading-line">Loading flashcards…</p>}>
        <FlashcardsClient defaultCards={cards} />
      </Suspense>
    </div>
  );
}
