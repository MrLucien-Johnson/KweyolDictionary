/**
 * Seed content for the Dominican Kwéyòl–English Dictionary.
 * Dictionary entries come from the beginner product-density curriculum.
 * Entries are APPROVED for public product use and remain open to community correction.
 */
export type { SeedEntry } from "@/data/types";
import { BEGINNER_CURRICULUM_ENTRIES } from "@/data/beginner-curriculum";

export const SEED_ENTRIES = BEGINNER_CURRICULUM_ENTRIES;

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
      {
        prompt: "What does “orevwa” mean?",
        questionType: "multiple-choice",
        explanation: "Orevwa is used to say goodbye.",
        answers: [
          { answerText: "Please", isCorrect: false },
          { answerText: "Goodbye", isCorrect: true },
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
      {
        prompt: "Which English word matches “vèt”?",
        questionType: "matching",
        explanation: "Vèt means green.",
        answers: [
          { answerText: "Yellow", isCorrect: false },
          { answerText: "Green", isCorrect: true },
          { answerText: "Black", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "numbers-basics",
    title: "Numbers: basics",
    description: "Choose the correct English number.",
    audience: "ADULT" as const,
    difficulty: "BEGINNER" as const,
    questions: [
      {
        prompt: "What does “twa” mean?",
        questionType: "multiple-choice",
        explanation: "Twa means three.",
        answers: [
          { answerText: "Two", isCorrect: false },
          { answerText: "Three", isCorrect: true },
          { answerText: "Ten", isCorrect: false },
        ],
      },
      {
        prompt: "What does “dis” mean?",
        questionType: "multiple-choice",
        explanation: "Dis means ten.",
        answers: [
          { answerText: "Ten", isCorrect: true },
          { answerText: "Two", isCorrect: false },
          { answerText: "Five", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "nature-island",
    title: "Nature Island words",
    description: "Practice nature and place vocabulary linked to Dominica.",
    audience: "ADULT" as const,
    difficulty: "BEGINNER" as const,
    questions: [
      {
        prompt: "What does “rivyè” mean?",
        questionType: "multiple-choice",
        explanation: "Rivyè means river.",
        answers: [
          { answerText: "Mountain", isCorrect: false },
          { answerText: "River", isCorrect: true },
          { answerText: "Market", isCorrect: false },
        ],
      },
      {
        prompt: "What does “Dominik” refer to?",
        questionType: "multiple-choice",
        explanation: "Dominik refers to Dominica.",
        answers: [
          { answerText: "Dominica", isCorrect: true },
          { answerText: "A type of fish", isCorrect: false },
          { answerText: "A colour", isCorrect: false },
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
