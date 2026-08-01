import type { Metadata } from "next";
import Link from "next/link";
import { AlphabetNav } from "@/components/dictionary/AlphabetNav";
import { DictionaryFilters } from "@/components/dictionary/DictionaryFilters";
import { WordCard } from "@/components/dictionary/WordCard";
import {
  getPartsOfSpeech,
  getPublicCategories,
  listDictionaryEntries,
} from "@/lib/dictionary/queries";
import type { DifficultyLevel } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Adult Dictionary",
  description:
    "Search and browse the Dominican Kwéyòl–English adult dictionary.",
};

type DictionaryPageProps = {
  searchParams: Promise<{
    q?: string;
    letter?: string;
    pos?: string;
    category?: string;
    difficulty?: string;
    audio?: string;
    examples?: string;
    cultural?: string;
    featured?: string;
    recent?: string;
  }>;
};

export default async function DictionaryPage({ searchParams }: DictionaryPageProps) {
  const params = await searchParams;
  const filters = {
    q: params.q?.trim() || undefined,
    letter: params.letter?.trim() || undefined,
    partOfSpeech: params.pos?.trim() || undefined,
    category: params.category?.trim() || undefined,
    difficulty: (params.difficulty?.trim() || undefined) as
      | DifficultyLevel
      | undefined,
    hasAudio: params.audio === "1",
    hasExamples: params.examples === "1",
    hasCulturalNotes: params.cultural === "1",
    featured: params.featured === "1",
    recent: params.recent === "1",
  };

  const [entries, partsOfSpeech, categories] = await Promise.all([
    listDictionaryEntries(filters),
    getPartsOfSpeech(),
    getPublicCategories(),
  ]);

  return (
    <div className="dict-page">
      <header className="dict-page__header">
        <h1>Adult Dictionary</h1>
        <p>
          Search Dominica’s Kwéyòl by Kwéyòl or English. Only approved entries
          appear here.
        </p>
      </header>

      <AlphabetNav activeLetter={filters.letter} />

      <DictionaryFilters
        current={filters}
        partsOfSpeech={partsOfSpeech}
        categories={categories.map((category) => ({
          value: category.key,
          label: category.nameEn,
        }))}
      />

      <div className="dict-page__toolbar">
        <p>
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
        <Link href="/dictionary/favourites" className="text-link">
          View favourites
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state" role="status">
          <h2>No matching approved entries</h2>
          <p>
            Try another spelling, clear filters, or explore the alphabet. Draft
            demonstration words stay hidden until they are reviewed and
            approved.
          </p>
        </div>
      ) : (
        <div className="word-grid">
          {entries.map((entry) => (
            <WordCard
              key={entry.id}
              slug={entry.slug}
              kweyolWord={entry.kweyolWord}
              englishTranslation={entry.englishTranslation}
              partOfSpeech={entry.partOfSpeech}
              pronunciationGuide={entry.pronunciationGuide}
            />
          ))}
        </div>
      )}
    </div>
  );
}
