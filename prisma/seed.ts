import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ADULT_CATEGORY_DEFINITIONS,
  CHILD_CATEGORY_DEFINITIONS,
} from "../src/lib/constants/categories";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

async function main() {
  const categoryDefs = [
    ...ADULT_CATEGORY_DEFINITIONS,
    ...CHILD_CATEGORY_DEFINITIONS.filter(
      (child) =>
        !ADULT_CATEGORY_DEFINITIONS.some((adult) => adult.key === child.key),
    ),
  ];

  for (const [index, category] of categoryDefs.entries()) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: {
        nameEn: category.nameEn,
        audience: category.audience,
        sortOrder: index,
      },
      create: {
        key: category.key,
        nameEn: category.nameEn,
        audience: category.audience,
        sortOrder: index,
      },
    });
  }

  await prisma.editorialNote.upsert({
    where: { key: "language-variation" },
    update: {},
    create: {
      key: "language-variation",
      title: "Language varies",
      body: "Dominican Kwéyòl varies by community, generation, speaker and context.",
    },
  });

  /**
   * Demonstration entries only — explicitly DRAFT.
   * Do not treat these as approved Dominican Kwéyòl vocabulary.
   */
  const demoEntries = [
    {
      slug: "bonjou-demo",
      kweyolWord: "bonjou",
      englishTranslation: "good morning",
      partOfSpeech: "interjection",
      pronunciationGuide: "bon-zhoo",
      simpleDefinition:
        "A morning greeting. (Demonstration draft — needs review.)",
      topicCategory: "greetings",
      reviewStatus: "DRAFT" as const,
      audience: "BOTH" as const,
      adultPresentation: {
        displayDefinition:
          "Used as a polite morning greeting. Demonstration draft only.",
      },
      childPresentation: {
        simpleMeaning: "We say this in the morning to say hello.",
        shortExampleKweyol: "Bonjou!",
        shortExampleEnglish: "Good morning!",
        ageBand: "EARLY_4_6" as const,
        childCategoryKey: "family",
      },
      example: {
        kweyolText: "Bonjou, kouman ou yé?",
        englishText: "Good morning, how are you?",
      },
    },
    {
      slug: "dlo-demo",
      kweyolWord: "dlo",
      englishTranslation: "water",
      partOfSpeech: "noun",
      pronunciationGuide: "dlo",
      simpleDefinition: "Water. (Demonstration draft — needs review.)",
      topicCategory: "food-and-drink",
      reviewStatus: "DRAFT" as const,
      audience: "BOTH" as const,
      adultPresentation: {
        displayDefinition:
          "Fresh water or drinking water. Demonstration draft only.",
      },
      childPresentation: {
        simpleMeaning: "Water we drink.",
        shortExampleKweyol: "Mwen vlé dlo.",
        shortExampleEnglish: "I want water.",
        ageBand: "EARLY_4_6" as const,
        childCategoryKey: "food",
      },
      example: {
        kweyolText: "Ban mwen dlo, souplé.",
        englishText: "Give me water, please.",
      },
    },
  ];

  for (const entry of demoEntries) {
    await prisma.dictionaryEntry.upsert({
      where: { slug: entry.slug },
      update: {
        reviewStatus: "DRAFT",
        simpleDefinition: entry.simpleDefinition,
      },
      create: {
        slug: entry.slug,
        kweyolWord: entry.kweyolWord,
        englishTranslation: entry.englishTranslation,
        partOfSpeech: entry.partOfSpeech,
        pronunciationGuide: entry.pronunciationGuide,
        simpleDefinition: entry.simpleDefinition,
        topicCategory: entry.topicCategory,
        reviewStatus: entry.reviewStatus,
        audience: entry.audience,
        sourceOrContributor: "Phase 2 demonstration seed (unverified)",
        adultPresentation: {
          create: entry.adultPresentation,
        },
        childPresentation: {
          create: entry.childPresentation,
        },
        examples: {
          create: [
            {
              kweyolText: entry.example.kweyolText,
              englishText: entry.example.englishText,
              isPrimary: true,
              audience: "ADULT",
            },
          ],
        },
      },
    });
  }

  console.log(
    `Seed complete: ${categoryDefs.length} categories, ${demoEntries.length} DRAFT demo entries.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
