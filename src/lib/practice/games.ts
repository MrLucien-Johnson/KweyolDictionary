import { getCatalog } from "@/lib/content/catalog";
import type { PublishedEntry } from "@/lib/content/types";
import {
  findHeadwordTokenIndex,
  joinTokens,
  pickDistractors,
  shuffleInPlace,
  tokenizeSentence,
} from "@/lib/practice/sentence";

export type PracticeAudience = "ADULT" | "CHILD" | "BOTH";
export type PracticeActivityType = "sentence-cloze" | "sentence-tiles";
export type PracticeDeck =
  | "featured"
  | "greetings"
  | "family"
  | "verbs"
  | "everyday-child";

export type PracticeGameMeta = {
  slug: string;
  title: string;
  description: string;
  activityType: PracticeActivityType;
  audience: PracticeAudience;
  deck: PracticeDeck;
  maxRounds: number;
  maxTokens?: number;
};

export type ClozeRound = {
  id: string;
  type: "sentence-cloze";
  entrySlug: string;
  headword: string;
  english: string;
  promptSentence: string;
  englishHint: string;
  options: string[];
  correctOption: string;
};

export type TilesRound = {
  id: string;
  type: "sentence-tiles";
  entrySlug: string;
  headword: string;
  english: string;
  englishHint: string;
  correctTokens: string[];
  shuffledTokens: string[];
};

export type PracticeRound = ClozeRound | TilesRound;

export type PracticeGame = PracticeGameMeta & {
  rounds: PracticeRound[];
};

export const PRACTICE_GAMES: PracticeGameMeta[] = [
  {
    slug: "featured-sentence-cloze",
    title: "Complete the sentence",
    description:
      "Fill the blank in everyday Kwéyòl sentences using common featured words.",
    activityType: "sentence-cloze",
    audience: "ADULT",
    deck: "featured",
    maxRounds: 12,
  },
  {
    slug: "featured-sentence-tiles",
    title: "Build the sentence",
    description:
      "Put the words in order to rebuild natural Kwéyòl sentences.",
    activityType: "sentence-tiles",
    audience: "ADULT",
    deck: "featured",
    maxRounds: 10,
    maxTokens: 8,
  },
  {
    slug: "greetings-sentence-cloze",
    title: "Greetings in sentences",
    description: "Practise the most common greeting words inside full sentences.",
    activityType: "sentence-cloze",
    audience: "BOTH",
    deck: "greetings",
    maxRounds: 8,
  },
  {
    slug: "family-sentence-cloze",
    title: "Family words in sentences",
    description: "Choose the right family word to complete each sentence.",
    activityType: "sentence-cloze",
    audience: "BOTH",
    deck: "family",
    maxRounds: 10,
  },
  {
    slug: "kids-everyday-cloze",
    title: "Kids: finish the sentence",
    description:
      "Short sentences with everyday words — pick the missing Kwéyòl word.",
    activityType: "sentence-cloze",
    audience: "CHILD",
    deck: "everyday-child",
    maxRounds: 8,
    maxTokens: 6,
  },
  {
    slug: "kids-everyday-tiles",
    title: "Kids: line up the words",
    description: "Tap the words in order to build a short Kwéyòl sentence.",
    activityType: "sentence-tiles",
    audience: "CHILD",
    deck: "everyday-child",
    maxRounds: 6,
    maxTokens: 5,
  },
];

function deckEntries(deck: PracticeDeck): PublishedEntry[] {
  const entries = getCatalog().entries.filter(
    (entry) =>
      entry.reviewStatus === "APPROVED" &&
      entry.examples.length > 0 &&
      Boolean(entry.examples[0]?.kweyolText),
  );

  if (deck === "featured") {
    return entries.filter((entry) => entry.isFeatured);
  }
  if (deck === "greetings") {
    return entries.filter(
      (entry) =>
        entry.topicCategory === "greetings" ||
        entry.categories.includes("greetings"),
    );
  }
  if (deck === "family") {
    return entries.filter(
      (entry) =>
        entry.topicCategory === "family" || entry.categories.includes("family"),
    );
  }
  if (deck === "verbs") {
    return entries.filter(
      (entry) =>
        entry.topicCategory === "verbs" || entry.categories.includes("verbs"),
    );
  }
  // everyday-child: featured or greetings/family that also appear in children dict
  return entries.filter(
    (entry) =>
      entry.childPresentation?.showInChildrenDictionary &&
      (entry.isFeatured ||
        entry.topicCategory === "greetings" ||
        entry.topicCategory === "family" ||
        entry.topicCategory === "colours" ||
        entry.topicCategory === "numbers"),
  );
}

function buildClozeRound(
  entry: PublishedEntry,
  pool: PublishedEntry[],
): ClozeRound | null {
  const example = entry.examples[0];
  if (!example) return null;
  const tokens = tokenizeSentence(example.kweyolText);
  if (tokens.length < 2) return null;
  const index = findHeadwordTokenIndex(tokens, entry.kweyolWord);
  if (index < 0) return null;

  const correctOption = entry.kweyolWord;
  const promptTokens = [...tokens];
  promptTokens[index] = "______";
  const distractors = pickDistractors(
    correctOption,
    pool.map((row) => row.kweyolWord),
    3,
  );
  if (distractors.length < 2) return null;

  const options = shuffleInPlace([correctOption, ...distractors]);

  return {
    id: `${entry.slug}-cloze`,
    type: "sentence-cloze",
    entrySlug: entry.slug,
    headword: entry.kweyolWord,
    english: entry.englishTranslation,
    promptSentence: joinTokens(promptTokens),
    englishHint: example.englishText,
    options,
    correctOption,
  };
}

function buildTilesRound(
  entry: PublishedEntry,
  maxTokens?: number,
): TilesRound | null {
  const example = entry.examples[0];
  if (!example) return null;
  const tokens = tokenizeSentence(example.kweyolText);
  if (tokens.length < 2) return null;
  if (maxTokens && tokens.length > maxTokens) return null;
  // Need at least one shuffle that differs; skip tiny punctuation-heavy lines
  const wordLike = tokens.filter((token) => /[\p{L}\p{M}]/u.test(token));
  if (wordLike.length < 2) return null;

  let shuffled = shuffleInPlace([...tokens]);
  let attempts = 0;
  while (joinTokens(shuffled) === joinTokens(tokens) && attempts < 8) {
    shuffled = shuffleInPlace([...tokens]);
    attempts += 1;
  }

  return {
    id: `${entry.slug}-tiles`,
    type: "sentence-tiles",
    entrySlug: entry.slug,
    headword: entry.kweyolWord,
    english: entry.englishTranslation,
    englishHint: example.englishText,
    correctTokens: tokens,
    shuffledTokens: shuffled,
  };
}

export function listPracticeGames(audience?: PracticeAudience): PracticeGameMeta[] {
  return PRACTICE_GAMES.filter((game) => {
    if (!audience) return true;
    if (audience === "BOTH") return true;
    if (audience === "CHILD") return game.audience === "CHILD";
    return game.audience === "ADULT" || game.audience === "BOTH";
  });
}

export function getPracticeGameMeta(slug: string) {
  return PRACTICE_GAMES.find((game) => game.slug === slug) ?? null;
}

export function buildPracticeGame(slug: string): PracticeGame | null {
  const meta = getPracticeGameMeta(slug);
  if (!meta) return null;

  const pool = deckEntries(meta.deck);
  const rounds: PracticeRound[] = [];

  for (const entry of shuffleInPlace([...pool])) {
    if (rounds.length >= meta.maxRounds) break;
    const round =
      meta.activityType === "sentence-cloze"
        ? buildClozeRound(entry, pool)
        : buildTilesRound(entry, meta.maxTokens);
    if (round) rounds.push(round);
  }

  if (!rounds.length) return null;
  return { ...meta, rounds };
}

/** Client-safe payload: cloze keeps correctOption for local check after answer. */
export function getPracticeGameForClient(slug: string) {
  return buildPracticeGame(slug);
}
