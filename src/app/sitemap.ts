import type { MetadataRoute } from "next";
import {
  getCatalog,
  listChildEntries,
  listEntries,
  listLessons,
} from "@/lib/content/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://mrlucien-johnson.github.io/KweyolDictionary";
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

  const words = listEntries({});
  const lessons = listLessons();
  const childWords = listChildEntries();
  const categories = getCatalog().childCategories;

  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...words.map((word) => ({
      url: `${base}/dictionary/${word.slug}`,
      lastModified: new Date(word.dateAdded),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...childWords.map((word) => ({
      url: `${base}/children/words/${word.slug}`,
      lastModified: new Date(word.dateAdded),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${base}/children/categories/${category.key}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...lessons.map((lesson) => ({
      url: `${base}/learn/${lesson.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
