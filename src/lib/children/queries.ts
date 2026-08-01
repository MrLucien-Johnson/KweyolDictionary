import { prisma } from "@/lib/db";
import { CHILD_CATEGORY_DEFINITIONS } from "@/lib/constants/categories";
import type { ChildAgeBand } from "@/generated/prisma/client";

export async function listChildCategories() {
  const counts = await prisma.childPresentation.groupBy({
    by: ["childCategoryKey"],
    where: {
      showInChildrenDictionary: true,
      entry: { reviewStatus: "APPROVED" },
    },
    _count: { _all: true },
  });

  return CHILD_CATEGORY_DEFINITIONS.map((category) => ({
    ...category,
    count:
      counts.find((row) => row.childCategoryKey === category.key)?._count._all ??
      0,
    imagePath: `/images/placeholders/${category.key}.svg`,
  }));
}

export async function listChildWords(options?: {
  category?: string;
  ageBand?: ChildAgeBand;
}) {
  return prisma.dictionaryEntry.findMany({
    where: {
      reviewStatus: "APPROVED",
      childPresentation: {
        is: {
          showInChildrenDictionary: true,
          ...(options?.category
            ? { childCategoryKey: options.category }
            : {}),
          ...(options?.ageBand ? { ageBand: options.ageBand } : {}),
        },
      },
    },
    include: {
      childPresentation: true,
      imageAssets: true,
      audioFiles: true,
    },
    orderBy: { kweyolWord: "asc" },
  });
}

export async function getChildWord(slug: string) {
  return prisma.dictionaryEntry.findFirst({
    where: {
      slug,
      reviewStatus: "APPROVED",
      childPresentation: { is: { showInChildrenDictionary: true } },
    },
    include: {
      childPresentation: true,
      imageAssets: true,
      audioFiles: true,
    },
  });
}

export async function listChildActivities(options?: {
  category?: string;
  ageBand?: ChildAgeBand;
}) {
  return prisma.childActivity.findMany({
    where: {
      reviewStatus: "APPROVED",
      ...(options?.category ? { categoryKey: options.category } : {}),
      ...(options?.ageBand ? { ageBand: options.ageBand } : {}),
    },
    orderBy: { title: "asc" },
  });
}
