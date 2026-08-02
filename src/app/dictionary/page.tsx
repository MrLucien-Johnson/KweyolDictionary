import type { Metadata } from "next";
import { Suspense } from "react";
import { DictionaryBrowser } from "@/components/dictionary/DictionaryBrowser";
import { ContentAccuracyNotice } from "@/components/layout/ContentAccuracyNotice";
import {
  getPartsOfSpeech,
  getPublicCategories,
} from "@/lib/dictionary/queries";

export const metadata: Metadata = {
  title: "Adult Dictionary",
  description:
    "Search and browse the Dominican Kwéyòl–English adult dictionary.",
};

export default async function DictionaryPage() {
  const [partsOfSpeech, categories] = await Promise.all([
    getPartsOfSpeech(),
    getPublicCategories(),
  ]);

  return (
    <div className="dict-page">
      <header className="dict-page__header">
        <h1>Adult Dictionary</h1>
        <p>
          Search Dominica’s Kwéyòl by Kwéyòl or English. Public entries are a
          provisional beginner curriculum, open to community correction.
        </p>
      </header>
      <ContentAccuracyNotice variant="panel" />
      <Suspense fallback={<p className="loading-line">Loading dictionary…</p>}>
        <DictionaryBrowser
          partsOfSpeech={partsOfSpeech}
          categories={categories.map((category) => ({
            value: category.key,
            label: category.nameEn,
          }))}
        />
      </Suspense>
    </div>
  );
}
