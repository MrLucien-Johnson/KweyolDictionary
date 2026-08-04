export const PRACTICE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type PracticeDifficulty = (typeof PRACTICE_DIFFICULTIES)[number];

export type PracticeDifficultyConfig = {
  id: PracticeDifficulty;
  label: string;
  blurb: string;
  /** Seconds allowed per round (0 = untimed). */
  secondsPerRound: number;
  distractors: number;
  showEnglishHint: boolean;
  lives: number;
  roundCap: number;
  /** Max sentence tokens for tile games; undefined keeps game default. */
  maxTokens?: number;
  basePoints: number;
  streakBonus: number;
  speedBonusMax: number;
};

export const PRACTICE_DIFFICULTY_CONFIG: Record<
  PracticeDifficulty,
  PracticeDifficultyConfig
> = {
  easy: {
    id: "easy",
    label: "Easy",
    blurb: "Hints on, no timer, three lives — great for learning.",
    secondsPerRound: 0,
    distractors: 2,
    showEnglishHint: true,
    lives: 3,
    roundCap: 8,
    maxTokens: 5,
    basePoints: 100,
    streakBonus: 20,
    speedBonusMax: 0,
  },
  medium: {
    id: "medium",
    label: "Medium",
    blurb: "Timed rounds, fewer hints, streak bonuses.",
    secondsPerRound: 20,
    distractors: 3,
    showEnglishHint: true,
    lives: 3,
    roundCap: 10,
    maxTokens: 7,
    basePoints: 150,
    streakBonus: 35,
    speedBonusMax: 50,
  },
  hard: {
    id: "hard",
    label: "Hard",
    blurb: "Fast clock, no English hint, tighter lives.",
    secondsPerRound: 12,
    distractors: 4,
    showEnglishHint: false,
    lives: 2,
    roundCap: 12,
    maxTokens: 9,
    basePoints: 220,
    streakBonus: 50,
    speedBonusMax: 80,
  },
};

export function parsePracticeDifficulty(
  value: string | null | undefined,
): PracticeDifficulty | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return (PRACTICE_DIFFICULTIES as readonly string[]).includes(normalized)
    ? (normalized as PracticeDifficulty)
    : null;
}

export function scoreRoundPoints(input: {
  difficulty: PracticeDifficulty;
  streakAfterCorrect: number;
  secondsLeft: number | null;
  secondsPerRound: number;
}) {
  const config = PRACTICE_DIFFICULTY_CONFIG[input.difficulty];
  let points = config.basePoints;
  if (input.streakAfterCorrect > 1) {
    points += config.streakBonus * (input.streakAfterCorrect - 1);
  }
  if (
    config.secondsPerRound > 0 &&
    input.secondsLeft != null &&
    input.secondsPerRound > 0
  ) {
    const ratio = Math.max(0, Math.min(1, input.secondsLeft / input.secondsPerRound));
    points += Math.round(config.speedBonusMax * ratio);
  }
  return points;
}

export function starRating(score: number, maxPossible: number) {
  if (maxPossible <= 0) return 0;
  const ratio = score / maxPossible;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.55) return 2;
  if (ratio > 0) return 1;
  return 0;
}
