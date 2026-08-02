import catalogJson from "@/data/published/catalog.json";
import { normalizeSearchText } from "@/lib/search/normalize";
import type { PublishedCatalog, PublishedEntry } from "@/lib/content/types";

const catalog = catalogJson as PublishedCatalog;

export function getCatalog(): PublishedCatalog {
  return catalog;
}

export type CatalogListFilters = {
  q?: string;
  letter?: string;
  partOfSpeech?: string;
  category?: string;
  difficulty?: string;
  hasAudio?: boolean;
  hasExamples?: boolean;
  hasCulturalNotes?: boolean;
  featured?: boolean;
  recent?: boolean;
};

function matchesQuery(entry: PublishedEntry, q: string) {
  const needle = normalizeSearchText(q);
  const haystack = normalizeSearchText(
    [
      entry.kweyolWord,
      entry.englishTranslation,
      entry.alternativeEnglish ?? "",
      entry.alternativeSpelling ?? "",
      entry.simpleDefinition,
      entry.slug,
    ].join(" "),
  );
  return haystack.includes(needle);
}

export function listEntries(filters: CatalogListFilters = {}): PublishedEntry[] {
  let rows = catalog.entries.filter(
    (entry) =>
      entry.reviewStatus === "APPROVED" &&
      (entry.audience === "ADULT" || entry.audience === "BOTH"),
  );

  if (filters.q?.trim()) {
    rows = rows.filter((entry) => matchesQuery(entry, filters.q!.trim()));
  }
  if (filters.letter) {
    const letter = filters.letter.toLowerCase();
    rows = rows.filter(
      (entry) =>
        normalizeSearchText(entry.kweyolWord).startsWith(letter) ||
        entry.slug.startsWith(letter),
    );
  }
  if (filters.partOfSpeech) {
    rows = rows.filter((entry) => entry.partOfSpeech === filters.partOfSpeech);
  }
  if (filters.difficulty) {
    rows = rows.filter((entry) => entry.difficulty === filters.difficulty);
  }
  if (filters.category) {
    rows = rows.filter(
      (entry) =>
        entry.topicCategory === filters.category ||
        entry.categories.includes(filters.category!),
    );
  }
  if (filters.hasAudio) {
    rows = rows.filter((entry) =>
      entry.audioFiles.some((file) => file.status !== "MISSING"),
    );
  }
  if (filters.hasExamples) {
    rows = rows.filter((entry) => entry.examples.length > 0);
  }
  if (filters.hasCulturalNotes) {
    rows = rows.filter((entry) => Boolean(entry.culturalNotes?.trim()));
  }
  if (filters.featured) {
    rows = rows.filter((entry) => entry.isFeatured);
  }

  rows = [...rows].sort((a, b) =>
    filters.recent
      ? b.dateAdded.localeCompare(a.dateAdded) ||
        a.kweyolWord.localeCompare(b.kweyolWord)
      : a.kweyolWord.localeCompare(b.kweyolWord),
  );

  return filters.recent ? rows.slice(0, 12) : rows;
}

export function getEntry(slug: string): PublishedEntry | undefined {
  return catalog.entries.find(
    (entry) => entry.slug === slug && entry.reviewStatus === "APPROVED",
  );
}

export function getAdjacent(slug: string) {
  const approved = listEntries({});
  const index = approved.findIndex((entry) => entry.slug === slug);
  return {
    previous: index > 0 ? approved[index - 1] : null,
    next: index >= 0 && index < approved.length - 1 ? approved[index + 1] : null,
  };
}

export function getWordOfTheDay() {
  const eligible = listEntries({}).filter((entry) => entry.isWordOfDayEligible);
  if (!eligible.length) return null;
  const dayIndex = Math.floor(Date.now() / 86_400_000) % eligible.length;
  return eligible[dayIndex] ?? null;
}

export function getPartsOfSpeech() {
  return [
    ...new Set(listEntries({}).map((entry) => entry.partOfSpeech).filter(Boolean)),
  ].sort();
}

export function listChildEntries(options?: {
  category?: string;
  ageBand?: string;
}) {
  return catalog.entries.filter((entry) => {
    const child = entry.childPresentation;
    if (!child?.showInChildrenDictionary) return false;
    if (entry.reviewStatus !== "APPROVED") return false;
    if (options?.category && child.childCategoryKey !== options.category) {
      return false;
    }
    if (options?.ageBand && child.ageBand !== options.ageBand) return false;
    return true;
  });
}

export function getChildEntry(slug: string) {
  return listChildEntries().find((entry) => entry.slug === slug);
}

export function listLessons() {
  return [...catalog.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getLesson(slug: string) {
  return catalog.lessons.find((lesson) => lesson.slug === slug);
}

export function listQuizzes() {
  return catalog.quizzes.map((quiz) => ({
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    audience: quiz.audience,
    difficulty: quiz.difficulty,
  }));
}

export function getQuiz(slug: string) {
  return catalog.quizzes.find((quiz) => quiz.slug === slug);
}

/** Public play payload omits correctness flags. */
export function getQuizForClient(slug: string) {
  const quiz = getQuiz(slug);
  if (!quiz) return null;
  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      questionType: question.questionType,
      answers: question.answers.map((answer) => ({
        id: answer.id,
        answerText: answer.answerText,
      })),
    })),
  };
}

export function scoreQuizLocally(
  slug: string,
  answers: { questionId: string; answerId: string }[],
) {
  const quiz = getQuiz(slug);
  if (!quiz) return null;
  const results = quiz.questions.map((question) => {
    const submitted = answers.find((answer) => answer.questionId === question.id);
    const correct = question.answers.find((answer) => answer.isCorrect);
    const chosen = question.answers.find((answer) => answer.id === submitted?.answerId);
    return {
      questionId: question.id,
      prompt: question.prompt,
      isCorrect: Boolean(chosen?.isCorrect),
      explanation: question.explanation,
      correctAnswerText: correct?.answerText ?? null,
      chosenAnswerText: chosen?.answerText ?? null,
    };
  });
  return {
    quizTitle: quiz.title,
    total: results.length,
    score: results.filter((result) => result.isCorrect).length,
    results,
  };
}

export function listActivities(options?: { category?: string; ageBand?: string }) {
  return catalog.childActivities.filter((activity) => {
    if (options?.category && activity.categoryKey !== options.category) return false;
    if (options?.ageBand && activity.ageBand !== options.ageBand) return false;
    return true;
  });
}

export function getActivity(slug: string) {
  return catalog.childActivities.find((activity) => activity.slug === slug);
}

export function listAdultCategories() {
  return catalog.adultCategories;
}

export function listChildCategories() {
  return catalog.childCategories;
}

export function withBasePath(assetPath: string) {
  if (!assetPath.startsWith("/")) return assetPath;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base) return assetPath;
  return `${base}${assetPath}`;
}
