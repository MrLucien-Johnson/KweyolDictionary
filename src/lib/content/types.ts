export type PublishedExample = {
  id: string;
  kweyolText: string;
  englishText: string;
  isPrimary: boolean;
  audience: string;
};

export type PublishedEntry = {
  id: string;
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  alternativeEnglish: string | null;
  partOfSpeech: string;
  pronunciationGuide: string;
  simpleDefinition: string;
  detailedDefinition: string;
  culturalNotes: string | null;
  grammaticalNotes: string | null;
  usageNotes: string | null;
  topicCategory: string;
  difficulty: string;
  reviewStatus: string;
  alternativeSpelling: string | null;
  pluralForm: string | null;
  isFeatured: boolean;
  isWordOfDayEligible: boolean;
  audience: string;
  dateAdded: string;
  examples: PublishedExample[];
  audioFiles: { id: string; filePath: string; status: string }[];
  imageAssets: {
    id: string;
    filePath: string | null;
    fileName: string;
    altText: string;
    status: string;
  }[];
  adultPresentation: {
    displayDefinition: string;
    learningNotes: string | null;
    showInPublicDictionary: boolean;
  } | null;
  childPresentation: {
    simpleMeaning: string;
    shortExampleKweyol: string;
    shortExampleEnglish: string;
    funFact: string | null;
    culturalFact: string | null;
    ageBand: string;
    childCategoryKey: string;
    showInChildrenDictionary: boolean;
  } | null;
  categories: string[];
  relatedSlugs: string[];
};

export type PublishedCatalog = {
  generatedAt: string;
  language: string;
  entries: PublishedEntry[];
  adultCategories: {
    key: string;
    nameEn: string;
    nameKweyol?: string;
    audience: string;
  }[];
  childCategories: {
    key: string;
    nameEn: string;
    audience: string;
    count: number;
    imagePath: string;
  }[];
  lessons: {
    slug: string;
    title: string;
    shortExplanation: string;
    examples: { kweyol: string; english: string }[];
    commonMistakes?: string;
    practiceActivity?: string;
    pronunciationSupport?: string;
    sortOrder: number;
  }[];
  quizzes: {
    slug: string;
    title: string;
    description: string;
    audience: string;
    difficulty: string;
    questions: {
      id: string;
      prompt: string;
      questionType: string;
      explanation: string;
      answers: { id: string; answerText: string; isCorrect: boolean }[];
    }[];
  }[];
  childActivities: {
    slug: string;
    title: string;
    description?: string;
    activityType: string;
    ageBand: string;
    categoryKey?: string;
    configJson?: string;
  }[];
};
