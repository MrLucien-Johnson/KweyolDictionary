import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = [
    "",
    "/dictionary",
    "/children",
    "/children/words",
    "/children/activities",
    "/learn",
    "/learn/flashcards",
    "/contribute",
    "/about",
  ];

  const [words, lessons, childWords] = await Promise.all([
    prisma.dictionaryEntry.findMany({
      where: { reviewStatus: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.grammarLesson.findMany({
      where: { reviewStatus: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.dictionaryEntry.findMany({
      where: {
        reviewStatus: "APPROVED",
        childPresentation: { is: { showInChildrenDictionary: true } },
      },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...words.map((word) => ({
      url: `${base}/dictionary/${word.slug}`,
      lastModified: word.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...childWords.map((word) => ({
      url: `${base}/children/words/${word.slug}`,
      lastModified: word.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...lessons.map((lesson) => ({
      url: `${base}/learn/${lesson.slug}`,
      lastModified: lesson.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
