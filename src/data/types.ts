export type SeedEntry = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  alternativeEnglish?: string;
  partOfSpeech: string;
  pronunciationGuide: string;
  simpleDefinition: string;
  detailedDefinition: string;
  culturalNotes?: string;
  grammaticalNotes?: string;
  usageNotes?: string;
  topicCategory: string;
  difficulty: "BEGINNER" | "ELEMENTARY" | "INTERMEDIATE" | "ADVANCED";
  reviewStatus: "DRAFT" | "APPROVED" | "NEEDS_REVIEW";
  isFeatured?: boolean;
  alternativeSpelling?: string;
  pluralForm?: string;
  example: { kweyolText: string; englishText: string };
  relatedSlugs?: string[];
  child?: {
    simpleMeaning: string;
    shortExampleKweyol: string;
    shortExampleEnglish: string;
    childCategoryKey: string;
    ageBand: "EARLY_4_6" | "GROWING_7_9" | "CONFIDENT_10_12";
    funFact?: string;
  };
};
