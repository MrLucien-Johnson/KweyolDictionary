import { getCatalog } from "@/lib/content/catalog";
import type { PublishedEntry } from "@/lib/content/types";
import {
  PRACTICE_DIFFICULTY_CONFIG,
  type PracticeDifficulty,
} from "@/lib/practice/difficulty";
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
  accent?: "sun" | "sea" | "leaf" | "mango";
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
  difficulty: PracticeDifficulty;
  rounds: PracticeRound[];
};

export const PRACTICE_GAMES: PracticeGameMeta[] = [
  {
    slug: "featured-sentence-cloze",
    title: "Blank Busters",
    description: "Fill the blank before the clock runs out.",
    activityType: "sentence-cloze",
    audience: "ADULT",
    deck: "featured",
    maxRounds: 12,
    accent: "leaf",
  },
  {
    slug: "featured-sentence-tiles",
    title: "Sentence Sprint",
    description: "Snap the tiles into the right order at speed.",
    activityType: "sentence-tiles",
    audience: "ADULT",
    deck: "featured",
    maxRounds: 10,
    maxTokens: 8,
    accent: "sea",
  },
  {
    slug: "greetings-sentence-cloze",
    title: "Greeting Dash",
    description: "Common hello/thanks words inside full sentences.",
    activityType: "sentence-cloze",
    audience: "BOTH",
    deck: "greetings",
    maxRounds: 8,
    accent: "sun",
  },
  {
    slug: "family-sentence-cloze",
    title: "Family Fill-in",
    description: "Pick the family word that completes each line.",
    activityType: "sentence-cloze",
    audience: "BOTH",
    deck: "family",
    maxRounds: 10,
    accent: "mango",
  },
  {
    slug: "kids-everyday-cloze",
    title: "Kids: Word Pop",
    description: "Short sentences — tap the missing everyday word.",
    activityType: "sentence-cloze",
    audience: "CHILD",
    deck: "everyday-child",
    maxRounds: 8,
    maxTokens: 6,
    accent: "sun",
  },
  {
    slug: "kids-everyday-tiles",
    title: "Kids: Line-up",
    description: "Line up the words to build a short Kwéyòl sentence.",
    activityType: "sentence-tiles",
    audience: "CHILD",
    deck: "everyday-child",
    maxRounds: 6,
    maxTokens: 5,
    accent: "mango",
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
  distractors: number,
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
  const chosen = pickDistractors(
    correctOption,
    pool.map((row) => row.kweyolWord),
    distractors,
  );
  if (chosen.length < Math.min(2, distractors)) return null;

  return {
    id: `${entry.slug}-cloze`,
    type: "sentence-cloze",
    entrySlug: entry.slug,
    headword: entry.kweyolWord,
    english: entry.englishTranslation,
    promptSentence: joinTokens(promptTokens),
    englishHint: example.englishText,
    options: shuffleInPlace([correctOption, ...chosen]),
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

export function buildPracticeGame(
  slug: string,
  difficulty: PracticeDifficulty = "medium",
): PracticeGame | null {
  const meta = getPracticeGameMeta(slug);
  if (!meta) return null;
  const config = PRACTICE_DIFFICULTY_CONFIG[difficulty];

  const pool = deckEntries(meta.deck);
  const rounds: PracticeRound[] = [];
  const roundLimit = Math.min(meta.maxRounds, config.roundCap);
  const tokenLimit = config.maxTokens ?? meta.maxTokens;

  for (const entry of shuffleInPlace([...pool])) {
    if (rounds.length >= roundLimit) break;
    const round =
      meta.activityType === "sentence-cloze"
        ? buildClozeRound(entry, pool, config.distractors)
        : buildTilesRound(entry, tokenLimit);
    if (round) rounds.push(round);
  }

  if (!rounds.length) return null;
  return { ...meta, difficulty, rounds };
}

export function getPracticeGameForClient(
  slug: string,
  difficulty: PracticeDifficulty = "medium",
) {
  return buildPracticeGame(slug, difficulty);
}
