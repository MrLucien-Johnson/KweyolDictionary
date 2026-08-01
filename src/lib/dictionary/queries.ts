import { prisma } from "@/lib/db";
import { normalizeSearchText } from "@/lib/search/normalize";
import type { DifficultyLevel, Prisma } from "@/generated/prisma/client";

export type DictionaryListFilters = {
  q?: string;
  letter?: string;
  partOfSpeech?: string;
  category?: string;
  difficulty?: DifficultyLevel;
  hasAudio?: boolean;
  hasExamples?: boolean;
  hasCulturalNotes?: boolean;
  featured?: boolean;
  recent?: boolean;
  includeDrafts?: boolean;
};

const publicWhere: Prisma.DictionaryEntryWhereInput = {
  reviewStatus: "APPROVED",
  audience: { in: ["ADULT", "BOTH"] },
  OR: [
    { adultPresentation: null },
    { adultPresentation: { showInPublicDictionary: true } },
  ],
};

function buildWhere(filters: DictionaryListFilters): Prisma.DictionaryEntryWhereInput {
  const where: Prisma.DictionaryEntryWhereInput = filters.includeDrafts
    ? { audience: { in: ["ADULT", "BOTH"] } }
    : { ...publicWhere };

  const and: Prisma.DictionaryEntryWhereInput[] = [];

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    const normalized = normalizeSearchText(q);
    and.push({
      OR: [
        { kweyolWord: { contains: q } },
        { englishTranslation: { contains: q } },
        { alternativeEnglish: { contains: q } },
        { alternativeSpelling: { contains: q } },
        { simpleDefinition: { contains: q } },
        // Normalized fallback for accent-insensitive matches on slug/ascii forms
        { slug: { contains: normalized } },
      ],
    });
  }

  if (filters.letter) {
    const letter = filters.letter.toLowerCase();
    and.push({
      OR: [
        { kweyolWord: { startsWith: letter } },
        { kweyolWord: { startsWith: letter.toUpperCase() } },
        { slug: { startsWith: letter } },
      ],
    });
  }

  if (filters.partOfSpeech) {
    and.push({ partOfSpeech: filters.partOfSpeech });
  }

  if (filters.difficulty) {
    and.push({ difficulty: filters.difficulty });
  }

  if (filters.category) {
    and.push({
      OR: [
        { topicCategory: filters.category },
        { categories: { some: { category: { key: filters.category } } } },
      ],
    });
  }

  if (filters.hasAudio) {
    and.push({ audioFiles: { some: { status: { in: ["CONFIRMED", "PLACEHOLDER"] } } } });
  }

  if (filters.hasExamples) {
    and.push({ examples: { some: {} } });
  }

  if (filters.hasCulturalNotes) {
    and.push({
      AND: [{ culturalNotes: { not: null } }, { culturalNotes: { not: "" } }],
    });
  }

  if (filters.featured) {
    and.push({ isFeatured: true });
  }

  if (and.length) {
    where.AND = and;
  }

  return where;
}

export async function listDictionaryEntries(filters: DictionaryListFilters = {}) {
  return prisma.dictionaryEntry.findMany({
    where: buildWhere(filters),
    include: {
      examples: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      audioFiles: true,
      imageAssets: true,
      categories: { include: { category: true } },
      adultPresentation: true,
    },
    orderBy: filters.recent
      ? [{ dateAdded: "desc" }, { kweyolWord: "asc" }]
      : [{ kweyolWord: "asc" }],
    take: filters.recent ? 12 : 200,
  });
}

export async function getEntryBySlug(slug: string, options?: { includeDrafts?: boolean }) {
  return prisma.dictionaryEntry.findFirst({
    where: {
      slug,
      ...(options?.includeDrafts ? {} : { reviewStatus: "APPROVED" }),
    },
    include: {
      examples: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      audioFiles: true,
      imageAssets: true,
      categories: { include: { category: true } },
      adultPresentation: true,
      childPresentation: true,
      synonyms: { include: { toEntry: true } },
      relatedFrom: { include: { fromEntry: true } },
    },
  });
}

export async function getAdjacentEntries(slug: string) {
  const approved = await prisma.dictionaryEntry.findMany({
    where: publicWhere,
    select: { slug: true, kweyolWord: true },
    orderBy: { kweyolWord: "asc" },
  });
  const index = approved.findIndex((entry) => entry.slug === slug);
  if (index < 0) {
    return { previous: null, next: null };
  }
  return {
    previous: index > 0 ? approved[index - 1] : null,
    next: index < approved.length - 1 ? approved[index + 1] : null,
  };
}

export async function getWordOfTheDay() {
  const entries = await prisma.dictionaryEntry.findMany({
    where: { ...publicWhere, isWordOfDayEligible: true },
    orderBy: { slug: "asc" },
  });
  if (!entries.length) return null;
  const dayIndex = Math.floor(Date.now() / 86_400_000) % entries.length;
  return entries[dayIndex] ?? null;
}

export async function getFeaturedEntries(limit = 6) {
  return prisma.dictionaryEntry.findMany({
    where: { ...publicWhere, isFeatured: true },
    orderBy: { kweyolWord: "asc" },
    take: limit,
  });
}

export async function getRecentEntries(limit = 8) {
  return listDictionaryEntries({ recent: true }).then((rows) => rows.slice(0, limit));
}

export async function getPartsOfSpeech() {
  const rows = await prisma.dictionaryEntry.findMany({
    where: publicWhere,
    select: { partOfSpeech: true },
    distinct: ["partOfSpeech"],
  });
  return rows
    .map((row) => row.partOfSpeech)
    .filter((value): value is string => Boolean(value))
    .sort();
}

export async function getPublicCategories() {
  return prisma.category.findMany({
    where: { audience: { in: ["ADULT", "BOTH"] } },
    orderBy: { sortOrder: "asc" },
  });
}
