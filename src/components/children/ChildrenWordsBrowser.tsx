"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChildWordCard } from "@/components/children/ChildWordCard";
import { ChildrenSearch } from "@/components/children/ChildrenSearch";
import { PrintStudySheet } from "@/components/dictionary/PrintStudySheet";
import { pickPlayableAudio } from "@/lib/audio/pick";
import { listChildEntries } from "@/lib/content/catalog";
import { normalizeSearchText } from "@/lib/search/normalize";
import { suggestEntries } from "@/lib/search/suggest";

type ChildrenWordsBrowserProps = {
  categoryKey?: string;
  categoryName?: string;
};

export function ChildrenWordsBrowser({
  categoryKey,
  categoryName,
}: ChildrenWordsBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const allWords = useMemo(
    () => listChildEntries(categoryKey ? { category: categoryKey } : undefined),
    [categoryKey],
  );

  const words = useMemo(() => {
    const needle = normalizeSearchText(urlQuery);
    if (!needle) return allWords;
    const ranked = suggestEntries(urlQuery, allWords, allWords.length);
    const bySlug = new Map(allWords.map((entry) => [entry.slug, entry]));
    const matched = ranked
      .map((hit) => bySlug.get(hit.slug))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    if (matched.length) return matched;
    return allWords.filter((entry) => {
      const haystack = normalizeSearchText(
        [
          entry.kweyolWord,
          entry.englishTranslation,
          entry.childPresentation?.simpleMeaning ?? "",
        ].join(" "),
      );
      return haystack.includes(needle);
    });
  }, [allWords, urlQuery]);

  function applyQuery(next: string) {
    const params = new URLSearchParams();
    if (next.trim()) params.set("q", next.trim());
    const query = params.toString();
    const base = categoryKey
      ? `/children/categories/${categoryKey}/`
      : "/children/words/";
    router.push(query ? `${base}?${query}` : base);
  }

  const printRows = words.map((word) => ({
    kweyolWord: word.kweyolWord,
    english:
      word.childPresentation?.simpleMeaning ?? word.englishTranslation,
    pronunciation: word.pronunciationGuide,
  }));

  return (
    <>
      <div className="children-words-toolbar no-print">
        <ChildrenSearch
          key={`child-search-${urlQuery}`}
          id={categoryKey ? `child-cat-search-${categoryKey}` : "child-words-search"}
          initialQuery={urlQuery}
          navigateOnSelect
          onSubmitQuery={applyQuery}
          formClassName="children-search children-search--inline"
          inputClassName="children-search__input"
        />
        <PrintStudySheet
          title={
            categoryName
              ? `${categoryName} · children’s study sheet`
              : "Children’s picture words · study sheet"
          }
          subtitle={
            urlQuery.trim()
              ? `Filtered by “${urlQuery.trim()}” · ${words.length} words`
              : `${words.length} words`
          }
          rows={printRows}
        />
      </div>

      <p className="dict-page__count" role="status" aria-live="polite">
        {words.length} {words.length === 1 ? "word" : "words"}
        {urlQuery.trim() ? ` for “${urlQuery.trim()}”` : ""}
      </p>

      {words.length ? (
        <div className="child-word-grid">
          {words.map((word) => {
            const image = word.imageAssets[0];
            const audio = pickPlayableAudio(word);
            return (
              <ChildWordCard
                key={word.id}
                slug={word.slug}
                kweyolWord={word.kweyolWord}
                meaning={
                  word.childPresentation?.simpleMeaning ??
                  word.englishTranslation
                }
                imageSrc={image?.filePath}
                imageStatus={image?.status}
                audioSrc={audio?.filePath}
                audioIsSynthetic={audio?.source === "SYNTHETIC_TTS"}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <h2>No matching picture words</h2>
          <p>Try a shorter word, another spelling, or browse all categories.</p>
          <button
            type="button"
            className="btn btn--soft btn--md"
            onClick={() => applyQuery("")}
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}
