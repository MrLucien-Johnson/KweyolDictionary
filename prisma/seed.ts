import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ADULT_CATEGORY_DEFINITIONS,
  CHILD_CATEGORY_DEFINITIONS,
} from "../src/lib/constants/categories";
import {
  SEED_CHILD_ACTIVITIES,
  SEED_ENTRIES,
  SEED_GRAMMAR_LESSONS,
  SEED_QUIZZES,
} from "../src/data/seed-entries";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

async function main() {
  // Remove earlier scaffolding leftovers so re-seeds stay clean.
  await prisma.quizAnswer.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.childActivity.deleteMany();
  await prisma.grammarLesson.deleteMany();
  await prisma.exampleSentence.deleteMany();
  await prisma.entryCategory.deleteMany();
  await prisma.imageAsset.deleteMany();
  await prisma.audioAsset.deleteMany();
  await prisma.adultPresentation.deleteMany();
  await prisma.childPresentation.deleteMany();
  await prisma.wordRelation.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.changeHistory.deleteMany();
  await prisma.dictionaryEntry.deleteMany();

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

  for (const entry of SEED_ENTRIES) {
    const existing = await prisma.dictionaryEntry.findUnique({
      where: { slug: entry.slug },
      include: { examples: true, adultPresentation: true, childPresentation: true },
    });

    if (existing) {
      await prisma.exampleSentence.deleteMany({ where: { entryId: existing.id } });
      if (existing.adultPresentation) {
        await prisma.adultPresentation.delete({ where: { entryId: existing.id } });
      }
      if (existing.childPresentation) {
        await prisma.childPresentation.delete({ where: { entryId: existing.id } });
      }
      await prisma.entryCategory.deleteMany({ where: { entryId: existing.id } });
      await prisma.imageAsset.deleteMany({ where: { entryId: existing.id } });
      await prisma.dictionaryEntry.delete({ where: { id: existing.id } });
    }

    const category = await prisma.category.findUnique({
      where: { key: entry.topicCategory },
    });

    const created = await prisma.dictionaryEntry.create({
      data: {
        slug: entry.slug,
        kweyolWord: entry.kweyolWord,
        englishTranslation: entry.englishTranslation,
        alternativeEnglish: entry.alternativeEnglish,
        partOfSpeech: entry.partOfSpeech,
        pronunciationGuide: entry.pronunciationGuide,
        simpleDefinition: entry.simpleDefinition,
        detailedDefinition: entry.detailedDefinition,
        culturalNotes: entry.culturalNotes,
        grammaticalNotes: entry.grammaticalNotes,
        usageNotes: entry.usageNotes,
        topicCategory: entry.topicCategory,
        difficulty: entry.difficulty,
        reviewStatus: entry.reviewStatus,
        alternativeSpelling: entry.alternativeSpelling,
        pluralForm: entry.pluralForm,
        isFeatured: Boolean(entry.isFeatured),
        audience: entry.child ? "BOTH" : "ADULT",
        sourceOrContributor:
          "Scaffolding seed — open for community/linguist correction",
        adultPresentation: {
          create: {
            displayDefinition: entry.detailedDefinition,
            learningNotes: entry.usageNotes,
            showInPublicDictionary: entry.reviewStatus === "APPROVED",
          },
        },
        ...(entry.child
          ? {
              childPresentation: {
                create: {
                  simpleMeaning: entry.child.simpleMeaning,
                  shortExampleKweyol: entry.child.shortExampleKweyol,
                  shortExampleEnglish: entry.child.shortExampleEnglish,
                  funFact: entry.child.funFact,
                  ageBand: entry.child.ageBand,
                  childCategoryKey: entry.child.childCategoryKey,
                  showInChildrenDictionary: entry.reviewStatus === "APPROVED",
                },
              },
            }
          : {}),
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
        imageAssets: entry.child
          ? {
              create: [
                {
                  categoryKey: entry.child.childCategoryKey,
                  fileName: `${entry.child.childCategoryKey}-${entry.slug}-kid-seed.webp`,
                  filePath: `/images/placeholders/${entry.child.childCategoryKey}.svg`,
                  altText: `Placeholder illustration for ${entry.kweyolWord}`,
                  status: "PLACEHOLDER",
                  audience: "CHILD",
                  generationBrief: JSON.stringify({
                    subject: entry.kweyolWord,
                    meaning: entry.child.simpleMeaning,
                    style: "Flat child-friendly illustration, Dominican context",
                    ageSuitability: entry.child.ageBand,
                    aspectRatio: "1:1",
                    mustInclude: [entry.englishTranslation],
                    mustNotInclude: [
                      "copyrighted cartoon characters",
                      "brand mascots",
                      "text-heavy posters",
                    ],
                    altText: `Illustration of ${entry.englishTranslation} for the Kwéyòl word ${entry.kweyolWord}`,
                  }),
                },
              ],
            }
          : undefined,
      },
    });

    if (category) {
      await prisma.entryCategory.create({
        data: { entryId: created.id, categoryId: category.id },
      });
    }
  }

  for (const lesson of SEED_GRAMMAR_LESSONS) {
    await prisma.grammarLesson.upsert({
      where: { slug: lesson.slug },
      update: {
        title: lesson.title,
        shortExplanation: lesson.shortExplanation,
        examplesJson: lesson.examplesJson,
        commonMistakes: lesson.commonMistakes,
        practiceActivity: lesson.practiceActivity,
        pronunciationSupport: lesson.pronunciationSupport,
        sortOrder: lesson.sortOrder,
        reviewStatus: "APPROVED",
      },
      create: {
        ...lesson,
        reviewStatus: "APPROVED",
      },
    });
  }

  for (const quiz of SEED_QUIZZES) {
    const existing = await prisma.quiz.findUnique({
      where: { slug: quiz.slug },
      include: { questions: { include: { answers: true } } },
    });
    if (existing) {
      for (const question of existing.questions) {
        await prisma.quizAnswer.deleteMany({ where: { questionId: question.id } });
      }
      await prisma.quizQuestion.deleteMany({ where: { quizId: existing.id } });
      await prisma.quiz.delete({ where: { id: existing.id } });
    }

    await prisma.quiz.create({
      data: {
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        audience: quiz.audience,
        difficulty: quiz.difficulty,
        reviewStatus: "APPROVED",
        questions: {
          create: quiz.questions.map((question, index) => ({
            prompt: question.prompt,
            questionType: question.questionType,
            explanation: question.explanation,
            sortOrder: index,
            answers: {
              create: question.answers.map((answer, answerIndex) => ({
                answerText: answer.answerText,
                isCorrect: answer.isCorrect,
                sortOrder: answerIndex,
              })),
            },
          })),
        },
      },
    });
  }

  for (const activity of SEED_CHILD_ACTIVITIES) {
    await prisma.childActivity.upsert({
      where: { slug: activity.slug },
      update: {
        title: activity.title,
        description: activity.description,
        activityType: activity.activityType,
        ageBand: activity.ageBand,
        categoryKey: activity.categoryKey,
        configJson: activity.configJson,
        reviewStatus: "APPROVED",
      },
      create: {
        ...activity,
        reviewStatus: "APPROVED",
      },
    });
  }

  const approved = SEED_ENTRIES.filter((entry) => entry.reviewStatus === "APPROVED").length;
  const drafts = SEED_ENTRIES.filter((entry) => entry.reviewStatus === "DRAFT").length;
  console.log(
    `Seed complete: ${categoryDefs.length} categories, ${approved} approved entries, ${drafts} drafts, ${SEED_GRAMMAR_LESSONS.length} lessons, ${SEED_QUIZZES.length} quizzes, ${SEED_CHILD_ACTIVITIES.length} child activities.`,
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
