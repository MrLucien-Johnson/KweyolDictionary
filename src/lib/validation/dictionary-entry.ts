import { z } from "zod";
import { REVIEW_STATUSES } from "@/lib/constants/review-status";
import { DIFFICULTY_LEVELS } from "@/lib/constants/age-groups";

export const reviewStatusSchema = z.enum(REVIEW_STATUSES);
export const difficultySchema = z.enum(DIFFICULTY_LEVELS);

export const audienceSchema = z.enum(["ADULT", "CHILD", "BOTH"]);
export const formalitySchema = z.enum(["INFORMAL", "NEUTRAL", "FORMAL"]);
export const childAgeBandSchema = z.enum([
  "EARLY_4_6",
  "GROWING_7_9",
  "CONFIDENT_10_12",
]);
export const mediaStatusSchema = z.enum([
  "MISSING",
  "PLACEHOLDER",
  "CONFIRMED",
]);

export const exampleSentenceSchema = z.object({
  kweyolText: z.string().min(1).max(500),
  englishText: z.string().min(1).max(500),
  isPrimary: z.boolean().default(false),
  audience: audienceSchema.default("ADULT"),
  sortOrder: z.number().int().min(0).default(0),
});

export const adultPresentationSchema = z.object({
  displayDefinition: z.string().max(2000).optional().nullable(),
  learningNotes: z.string().max(4000).optional().nullable(),
  showInPublicDictionary: z.boolean().default(true),
});

export const childPresentationSchema = z.object({
  simpleMeaning: z.string().min(1).max(300),
  shortExampleKweyol: z.string().max(300).optional().nullable(),
  shortExampleEnglish: z.string().max(300).optional().nullable(),
  funFact: z.string().max(500).optional().nullable(),
  culturalFact: z.string().max(500).optional().nullable(),
  ageBand: childAgeBandSchema.default("EARLY_4_6"),
  childCategoryKey: z.string().max(80).optional().nullable(),
  showInChildrenDictionary: z.boolean().default(true),
});

export const dictionaryEntryInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  kweyolWord: z.string().min(1).max(120),
  englishTranslation: z.string().min(1).max(200),
  alternativeEnglish: z.string().max(400).optional().nullable(),
  partOfSpeech: z.string().max(60).optional().nullable(),
  pronunciationGuide: z.string().max(200).optional().nullable(),
  simpleDefinition: z.string().max(500).optional().nullable(),
  detailedDefinition: z.string().max(4000).optional().nullable(),
  grammaticalNotes: z.string().max(4000).optional().nullable(),
  usageNotes: z.string().max(4000).optional().nullable(),
  culturalNotes: z.string().max(4000).optional().nullable(),
  pluralForm: z.string().max(120).optional().nullable(),
  verbForms: z.string().max(500).optional().nullable(),
  alternativeSpelling: z.string().max(200).optional().nullable(),
  formalityLevel: formalitySchema.default("NEUTRAL"),
  ageSuitability: z.string().max(80).optional().nullable(),
  difficulty: difficultySchema.default("BEGINNER"),
  audience: audienceSchema.default("BOTH"),
  topicCategory: z.string().max(80).optional().nullable(),
  sourceOrContributor: z.string().max(200).optional().nullable(),
  reviewStatus: reviewStatusSchema.default("DRAFT"),
  regionalWarning: z.string().max(500).optional().nullable(),
  isFeatured: z.boolean().default(false),
  examples: z.array(exampleSentenceSchema).default([]),
  adultPresentation: adultPresentationSchema.optional(),
  childPresentation: childPresentationSchema.optional(),
  categoryKeys: z.array(z.string().min(1).max(80)).default([]),
});

export type DictionaryEntryInput = z.infer<typeof dictionaryEntryInputSchema>;

/**
 * Public users should only see approved entries.
 * Draft / needs-review content remains admin-only.
 */
export function assertPublicEntryVisibility(status: string): boolean {
  return status === "APPROVED";
}
