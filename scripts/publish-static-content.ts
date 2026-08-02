/**
 * Build-time publisher: writes approved public content to JSON for static hosting.
 * Source of truth for GitHub Pages (no runtime database).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  SEED_CHILD_ACTIVITIES,
  SEED_ENTRIES,
  SEED_GRAMMAR_LESSONS,
  SEED_QUIZZES,
} from "../src/data/seed-entries";
import {
  ADULT_CATEGORY_DEFINITIONS,
  CHILD_CATEGORY_DEFINITIONS,
  buildImageFileName,
} from "../src/lib/constants/categories";

const outDir = path.join(process.cwd(), "src/data/published");
mkdirSync(outDir, { recursive: true });

const approved = SEED_ENTRIES.filter((entry) => entry.reviewStatus === "APPROVED");

const entries = approved.map((entry) => {
  const imagePath = entry.child
    ? `/images/placeholders/${entry.child.childCategoryKey}.svg`
    : null;
  return {
    id: entry.slug,
    slug: entry.slug,
    kweyolWord: entry.kweyolWord,
    englishTranslation: entry.englishTranslation,
    alternativeEnglish: entry.alternativeEnglish ?? null,
    partOfSpeech: entry.partOfSpeech,
    pronunciationGuide: entry.pronunciationGuide,
    simpleDefinition: entry.simpleDefinition,
    detailedDefinition: entry.detailedDefinition,
    culturalNotes: entry.culturalNotes ?? null,
    grammaticalNotes: entry.grammaticalNotes ?? null,
    usageNotes: entry.usageNotes ?? null,
    topicCategory: entry.topicCategory,
    difficulty: entry.difficulty,
    reviewStatus: entry.reviewStatus,
    alternativeSpelling: entry.alternativeSpelling ?? null,
    pluralForm: entry.pluralForm ?? null,
    isFeatured: Boolean(entry.isFeatured),
    isWordOfDayEligible: true,
    audience: entry.child ? "BOTH" : "ADULT",
    dateAdded: "2026-08-01T00:00:00.000Z",
    examples: [
      {
        id: `${entry.slug}-ex-1`,
        kweyolText: entry.example.kweyolText,
        englishText: entry.example.englishText,
        isPrimary: true,
        audience: "ADULT",
      },
    ],
    audioFiles: (() => {
      const relative = `/audio/${entry.slug}.mp3`;
      const absolute = path.join(process.cwd(), "public", "audio", `${entry.slug}.mp3`);
      if (!existsSync(absolute)) return [] as {
        id: string;
        filePath: string;
        status: "MISSING" | "PLACEHOLDER" | "CONFIRMED";
      }[];
      return [
        {
          id: `${entry.slug}-audio`,
          filePath: relative,
          // Files dropped in public/audio stay PLACEHOLDER until a reviewer confirms native audio.
          status: "PLACEHOLDER" as const,
        },
      ];
    })(),
    imageAssets: entry.child
      ? [
          {
            id: `${entry.slug}-img`,
            filePath: imagePath,
            fileName: buildImageFileName({
              categoryKey: entry.child.childCategoryKey,
              kweyolSlug: entry.slug,
              audienceTag: "kid",
              entryShortId: "seed",
            }),
            altText: `Placeholder illustration for ${entry.kweyolWord}`,
            status: "PLACEHOLDER" as const,
          },
        ]
      : [],
    adultPresentation: {
      displayDefinition: entry.detailedDefinition,
      learningNotes: entry.usageNotes ?? null,
      showInPublicDictionary: true,
    },
    childPresentation: entry.child
      ? {
          simpleMeaning: entry.child.simpleMeaning,
          shortExampleKweyol: entry.child.shortExampleKweyol,
          shortExampleEnglish: entry.child.shortExampleEnglish,
          funFact: entry.child.funFact ?? null,
          culturalFact: null,
          ageBand: entry.child.ageBand,
          childCategoryKey: entry.child.childCategoryKey,
          showInChildrenDictionary: true,
        }
      : null,
    categories: [entry.topicCategory],
    relatedSlugs: entry.relatedSlugs ?? [],
  };
});

const catalog = {
  generatedAt: new Date().toISOString(),
  language: "Dominican Kwéyòl",
  entries,
  adultCategories: ADULT_CATEGORY_DEFINITIONS,
  childCategories: CHILD_CATEGORY_DEFINITIONS.map((category) => ({
    ...category,
    count: entries.filter(
      (entry) => entry.childPresentation?.childCategoryKey === category.key,
    ).length,
    imagePath: `/images/placeholders/${category.key}.svg`,
  })),
  lessons: SEED_GRAMMAR_LESSONS.map((lesson) => ({
    ...lesson,
    reviewStatus: "APPROVED",
    examples: JSON.parse(lesson.examplesJson) as {
      kweyol: string;
      english: string;
    }[],
  })),
  quizzes: SEED_QUIZZES.map((quiz) => ({
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    audience: quiz.audience,
    difficulty: quiz.difficulty,
    questions: quiz.questions.map((question, index) => ({
      id: `${quiz.slug}-q${index + 1}`,
      prompt: question.prompt,
      questionType: question.questionType,
      explanation: question.explanation,
      answers: question.answers.map((answer, answerIndex) => ({
        id: `${quiz.slug}-q${index + 1}-a${answerIndex + 1}`,
        answerText: answer.answerText,
        isCorrect: answer.isCorrect,
      })),
    })),
  })),
  childActivities: SEED_CHILD_ACTIVITIES.map((activity) => ({
    ...activity,
    reviewStatus: "APPROVED",
  })),
};

writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(catalog, null, 2));
writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: catalog.generatedAt,
      entryCount: entries.length,
      lessonCount: catalog.lessons.length,
      quizCount: catalog.quizzes.length,
      activityCount: catalog.childActivities.length,
    },
    null,
    2,
  ),
);

console.log(
  `Published static catalog: ${entries.length} entries → src/data/published/catalog.json`,
);
