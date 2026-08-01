/**
 * Small demonstration / scaffolding vocabulary for local development.
 * Entries marked APPROVED are for product journeys and remain open to
 * community correction. They are not a complete linguistic authority.
 * DRAFT entries stay hidden from the public dictionary.
 */
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
  child?: {
    simpleMeaning: string;
    shortExampleKweyol: string;
    shortExampleEnglish: string;
    childCategoryKey: string;
    ageBand: "EARLY_4_6" | "GROWING_7_9" | "CONFIDENT_10_12";
    funFact?: string;
  };
};

export const SEED_ENTRIES: SeedEntry[] = [
  {
    slug: "bonjou",
    kweyolWord: "bonjou",
    englishTranslation: "good morning",
    partOfSpeech: "interjection",
    pronunciationGuide: "bon-zhoo",
    simpleDefinition: "A greeting used in the morning.",
    detailedDefinition:
      "A common daytime greeting used to wish someone a good morning.",
    culturalNotes:
      "Greetings are an important part of everyday courtesy in Dominica. Usage can vary by community and time of day.",
    topicCategory: "greetings",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    isFeatured: true,
    example: {
      kweyolText: "Bonjou, kouman ou yé?",
      englishText: "Good morning, how are you?",
    },
    child: {
      simpleMeaning: "We say this to say hello in the morning.",
      shortExampleKweyol: "Bonjou!",
      shortExampleEnglish: "Good morning!",
      childCategoryKey: "family",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "bonswa",
    kweyolWord: "bonswa",
    englishTranslation: "good evening",
    alternativeEnglish: "good night (greeting)",
    partOfSpeech: "interjection",
    pronunciationGuide: "bon-swa",
    simpleDefinition: "A greeting used later in the day or evening.",
    detailedDefinition: "Used to greet someone in the evening.",
    topicCategory: "greetings",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    isFeatured: true,
    example: {
      kweyolText: "Bonswa, tout moun.",
      englishText: "Good evening, everyone.",
    },
    child: {
      simpleMeaning: "Hello in the evening.",
      shortExampleKweyol: "Bonswa!",
      shortExampleEnglish: "Good evening!",
      childCategoryKey: "family",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "mesi",
    kweyolWord: "mèsi",
    englishTranslation: "thank you",
    partOfSpeech: "interjection",
    pronunciationGuide: "meh-see",
    simpleDefinition: "Used to thank someone.",
    detailedDefinition: "An expression of thanks.",
    topicCategory: "everyday-conversation",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    alternativeSpelling: "mesi",
    example: {
      kweyolText: "Mèsi anpil.",
      englishText: "Thank you very much.",
    },
    child: {
      simpleMeaning: "Say this when someone helps you.",
      shortExampleKweyol: "Mèsi!",
      shortExampleEnglish: "Thank you!",
      childCategoryKey: "feelings",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "dlo",
    kweyolWord: "dlo",
    englishTranslation: "water",
    partOfSpeech: "noun",
    pronunciationGuide: "dlo",
    simpleDefinition: "Water to drink or use.",
    detailedDefinition: "Fresh water; drinking water or water in nature.",
    culturalNotes:
      "Dominica is known as the Nature Island, with many rivers and waterfalls. Talk about water often connects to local geography.",
    topicCategory: "food-and-drink",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    isFeatured: true,
    example: {
      kweyolText: "Ban mwen dlo, souplé.",
      englishText: "Give me water, please.",
    },
    child: {
      simpleMeaning: "Water we drink.",
      shortExampleKweyol: "Mwen vlé dlo.",
      shortExampleEnglish: "I want water.",
      childCategoryKey: "food",
      ageBand: "EARLY_4_6",
      funFact: "Dominica has many rivers and waterfalls.",
    },
  },
  {
    slug: "manje",
    kweyolWord: "manjé",
    englishTranslation: "food",
    alternativeEnglish: "to eat",
    partOfSpeech: "noun",
    pronunciationGuide: "man-zhay",
    simpleDefinition: "Food; also used for the idea of eating.",
    detailedDefinition:
      "Can refer to food itself or, in related uses, the act of eating depending on context.",
    grammaticalNotes: "Learners should check context for noun vs verb-like uses.",
    topicCategory: "food-and-drink",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Manjé-a bon.",
      englishText: "The food is good.",
    },
    child: {
      simpleMeaning: "Things we eat.",
      shortExampleKweyol: "Manjé!",
      shortExampleEnglish: "Food!",
      childCategoryKey: "food",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "kay",
    kweyolWord: "kay",
    englishTranslation: "house",
    alternativeEnglish: "home",
    partOfSpeech: "noun",
    pronunciationGuide: "kai",
    simpleDefinition: "A house or home.",
    detailedDefinition: "A dwelling; someone’s house or home.",
    topicCategory: "home",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Kay mwen bèl.",
      englishText: "My house is beautiful.",
    },
    child: {
      simpleMeaning: "The place where we live.",
      shortExampleKweyol: "Sa sé kay mwen.",
      shortExampleEnglish: "That is my house.",
      childCategoryKey: "home",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "maman",
    kweyolWord: "maman",
    englishTranslation: "mother",
    alternativeEnglish: "mum, mom",
    partOfSpeech: "noun",
    pronunciationGuide: "ma-man",
    simpleDefinition: "Mother.",
    detailedDefinition: "A word for mother.",
    topicCategory: "family",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Maman mwen ka travay.",
      englishText: "My mother is working.",
    },
    child: {
      simpleMeaning: "Your mum.",
      shortExampleKweyol: "Maman!",
      shortExampleEnglish: "Mum!",
      childCategoryKey: "family",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "papa",
    kweyolWord: "papa",
    englishTranslation: "father",
    alternativeEnglish: "dad",
    partOfSpeech: "noun",
    pronunciationGuide: "pa-pa",
    simpleDefinition: "Father.",
    detailedDefinition: "A word for father.",
    topicCategory: "family",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Papa ka vini.",
      englishText: "Dad is coming.",
    },
    child: {
      simpleMeaning: "Your dad.",
      shortExampleKweyol: "Papa!",
      shortExampleEnglish: "Dad!",
      childCategoryKey: "family",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "wouj",
    kweyolWord: "wouj",
    englishTranslation: "red",
    partOfSpeech: "adjective",
    pronunciationGuide: "wooj",
    simpleDefinition: "The colour red.",
    detailedDefinition: "Describes something red in colour.",
    topicCategory: "colours",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    isFeatured: true,
    example: {
      kweyolText: "Flè-a wouj.",
      englishText: "The flower is red.",
    },
    child: {
      simpleMeaning: "The colour red.",
      shortExampleKweyol: "Sé wouj.",
      shortExampleEnglish: "It is red.",
      childCategoryKey: "colours",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "ble",
    kweyolWord: "blé",
    englishTranslation: "blue",
    partOfSpeech: "adjective",
    pronunciationGuide: "blay",
    simpleDefinition: "The colour blue.",
    detailedDefinition: "Describes something blue in colour.",
    topicCategory: "colours",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Syèl-la blé.",
      englishText: "The sky is blue.",
    },
    child: {
      simpleMeaning: "The colour blue.",
      shortExampleKweyol: "Sé blé.",
      shortExampleEnglish: "It is blue.",
      childCategoryKey: "colours",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "yon",
    kweyolWord: "yon",
    englishTranslation: "one",
    partOfSpeech: "numeral",
    pronunciationGuide: "yon",
    simpleDefinition: "The number one.",
    detailedDefinition: "Cardinal number one.",
    topicCategory: "numbers",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Yon mango.",
      englishText: "One mango.",
    },
    child: {
      simpleMeaning: "The number 1.",
      shortExampleKweyol: "Yon!",
      shortExampleEnglish: "One!",
      childCategoryKey: "numbers",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "de",
    kweyolWord: "dé",
    englishTranslation: "two",
    partOfSpeech: "numeral",
    pronunciationGuide: "day",
    simpleDefinition: "The number two.",
    detailedDefinition: "Cardinal number two.",
    topicCategory: "numbers",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Dé zanmi.",
      englishText: "Two friends.",
    },
    child: {
      simpleMeaning: "The number 2.",
      shortExampleKweyol: "Dé!",
      shortExampleEnglish: "Two!",
      childCategoryKey: "numbers",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "pwason",
    kweyolWord: "pwason",
    englishTranslation: "fish",
    partOfSpeech: "noun",
    pronunciationGuide: "pwa-son",
    simpleDefinition: "A fish; also fish as food.",
    detailedDefinition: "Fish as an animal or as food, depending on context.",
    culturalNotes:
      "Fishing and seafood are part of coastal Dominican life and meals.",
    topicCategory: "animals",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Nou ka manjé pwason.",
      englishText: "We are eating fish.",
    },
    child: {
      simpleMeaning: "A fish that swims in the sea or river.",
      shortExampleKweyol: "Gadé pwason-an!",
      shortExampleEnglish: "Look at the fish!",
      childCategoryKey: "sea-life",
      ageBand: "GROWING_7_9",
      funFact: "Many families in Dominica enjoy fresh fish.",
    },
  },
  {
    slug: "lapli",
    kweyolWord: "lapli",
    englishTranslation: "rain",
    partOfSpeech: "noun",
    pronunciationGuide: "la-plee",
    simpleDefinition: "Rain.",
    detailedDefinition: "Rainfall; wet weather.",
    topicCategory: "weather",
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    example: {
      kweyolText: "Lapli ka tonbé.",
      englishText: "Rain is falling.",
    },
    child: {
      simpleMeaning: "Water that falls from the sky.",
      shortExampleKweyol: "Lapli!",
      shortExampleEnglish: "Rain!",
      childCategoryKey: "weather",
      ageBand: "EARLY_4_6",
    },
  },
  {
    slug: "souple-draft",
    kweyolWord: "souplé",
    englishTranslation: "please",
    partOfSpeech: "adverb",
    pronunciationGuide: "soo-play",
    simpleDefinition: "Please. (Draft demonstration — needs review.)",
    detailedDefinition: "Used to make a polite request.",
    topicCategory: "everyday-conversation",
    difficulty: "BEGINNER",
    reviewStatus: "DRAFT",
    example: {
      kweyolText: "Édé mwen, souplé.",
      englishText: "Help me, please.",
    },
  },
];

export const SEED_GRAMMAR_LESSONS = [
  {
    slug: "alphabet-and-sounds",
    title: "Alphabet and sounds",
    shortExplanation:
      "Dominican Kwéyòl writing uses letters familiar from French-influenced Caribbean orthographies, with sounds that learners should practise carefully.",
    examplesJson: JSON.stringify([
      { kweyol: "a", english: "as in 'papa'" },
      { kweyol: "é", english: "a brighter vowel sound, as often taught in 'mèsi'" },
      { kweyol: "ou", english: "like 'oo' in 'food'" },
    ]),
    commonMistakes:
      "Do not assume every letter sounds exactly like English or French in every word.",
    practiceActivity:
      "Say bonjou, mèsi and dlo slowly. Tap each syllable, then listen again if audio is available.",
    pronunciationSupport: "Use the pronunciation guides on word pages while listening practice is expanded.",
    sortOrder: 1,
  },
  {
    slug: "greetings",
    title: "Greetings",
    shortExplanation:
      "Start conversations with everyday greetings such as bonjou and bonswa.",
    examplesJson: JSON.stringify([
      { kweyol: "Bonjou", english: "Good morning" },
      { kweyol: "Bonswa", english: "Good evening" },
      { kweyol: "Mèsi", english: "Thank you" },
    ]),
    commonMistakes:
      "Using a morning greeting late at night can sound odd; match the greeting to the time of day when you can.",
    practiceActivity:
      "Match each greeting to the best time of day, then say it aloud.",
    pronunciationSupport: "Practise with the Adult Dictionary audio controls when files are available.",
    sortOrder: 2,
  },
  {
    slug: "sentence-order",
    title: "Sentence order",
    shortExplanation:
      "Many everyday Kwéyòl sentences follow a familiar subject–marker–verb–object pattern. Learn with short model sentences first.",
    examplesJson: JSON.stringify([
      { kweyol: "Mwen ka manjé.", english: "I am eating." },
      { kweyol: "Papa ka vini.", english: "Dad is coming." },
    ]),
    commonMistakes:
      "Translating word-for-word from English can place markers in the wrong spot.",
    practiceActivity:
      "Reorder word tiles for two short sentences, then check the model answers in the practice quiz.",
    sortOrder: 3,
  },
  {
    slug: "questions-and-negatives",
    title: "Questions and negatives",
    shortExplanation:
      "Questions and negatives often rely on question words and negation markers. Learn a few high-frequency patterns before longer sentences.",
    examplesJson: JSON.stringify([
      { kweyol: "Kouman ou yé?", english: "How are you?" },
      { kweyol: "Mwen pa konnèt.", english: "I do not know." },
    ]),
    commonMistakes:
      "Forgetting the negation marker when trying to say a negative sentence.",
    practiceActivity:
      "Turn two affirmative sentences into negatives using the patterns from this lesson.",
    sortOrder: 4,
  },
];

export const SEED_QUIZZES = [
  {
    slug: "greetings-multiple-choice",
    title: "Greetings: multiple choice",
    description: "Choose the best English meaning for common greetings.",
    audience: "ADULT" as const,
    difficulty: "BEGINNER" as const,
    questions: [
      {
        prompt: "What does “bonjou” mean?",
        questionType: "multiple-choice",
        explanation: "Bonjou is a morning greeting meaning good morning.",
        answers: [
          { answerText: "Good morning", isCorrect: true },
          { answerText: "Good night only", isCorrect: false },
          { answerText: "Thank you", isCorrect: false },
        ],
      },
      {
        prompt: "What does “mèsi” mean?",
        questionType: "multiple-choice",
        explanation: "Mèsi means thank you.",
        answers: [
          { answerText: "Please", isCorrect: false },
          { answerText: "Thank you", isCorrect: true },
          { answerText: "Water", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "colours-match",
    title: "Colours: match the meaning",
    description: "Match Kwéyòl colour words to English.",
    audience: "ADULT" as const,
    difficulty: "BEGINNER" as const,
    questions: [
      {
        prompt: "Which English word matches “wouj”?",
        questionType: "matching",
        explanation: "Wouj means red.",
        answers: [
          { answerText: "Red", isCorrect: true },
          { answerText: "Blue", isCorrect: false },
          { answerText: "Green", isCorrect: false },
        ],
      },
    ],
  },
];

export const SEED_CHILD_ACTIVITIES = [
  {
    slug: "tap-picture-colours",
    title: "Tap the colour",
    description: "Hear or read a colour word and choose the matching picture card.",
    activityType: "tap-picture",
    ageBand: "EARLY_4_6" as const,
    categoryKey: "colours",
    configJson: JSON.stringify({
      prompts: [
        { slug: "wouj", label: "wouj", meaning: "red" },
        { slug: "ble", label: "blé", meaning: "blue" },
      ],
    }),
  },
  {
    slug: "match-family",
    title: "Match the family words",
    description: "Match Kwéyòl family words to simple English meanings.",
    activityType: "match-pairs",
    ageBand: "EARLY_4_6" as const,
    categoryKey: "family",
    configJson: JSON.stringify({
      pairs: [
        { kweyol: "maman", english: "mother" },
        { kweyol: "papa", english: "father" },
      ],
    }),
  },
  {
    slug: "memory-food",
    title: "Food memory cards",
    description: "Find matching Kwéyòl and English food cards.",
    activityType: "memory",
    ageBand: "GROWING_7_9" as const,
    categoryKey: "food",
    configJson: JSON.stringify({
      cards: [
        { id: "dlo", face: "dlo", match: "water" },
        { id: "manje", face: "manjé", match: "food" },
      ],
    }),
  },
  {
    slug: "spelling-yon",
    title: "Spell with letter tiles",
    description: "Build the word yon with letter tiles.",
    activityType: "spelling-tiles",
    ageBand: "CONFIDENT_10_12" as const,
    categoryKey: "numbers",
    configJson: JSON.stringify({
      target: "yon",
      tiles: ["y", "o", "n", "a", "e"],
    }),
  },
];
