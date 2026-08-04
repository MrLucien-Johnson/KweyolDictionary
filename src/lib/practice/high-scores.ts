const STORAGE_KEY = "kweyol-practice-highscores-v1";

export type PracticeHighScore = {
  score: number;
  stars: number;
  difficulty: string;
  at: string;
};

export function loadPracticeHighScores(): Record<string, PracticeHighScore> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PracticeHighScore>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function readPracticeHighScore(slug: string, difficulty: string) {
  const key = `${slug}:${difficulty}`;
  return loadPracticeHighScores()[key] ?? null;
}

export function savePracticeHighScore(input: {
  slug: string;
  difficulty: string;
  score: number;
  stars: number;
}) {
  if (typeof window === "undefined") return null;
  const all = loadPracticeHighScores();
  const key = `${input.slug}:${input.difficulty}`;
  const previous = all[key];
  if (previous && previous.score >= input.score) return previous;
  const next: PracticeHighScore = {
    score: input.score,
    stars: input.stars,
    difficulty: input.difficulty,
    at: new Date().toISOString(),
  };
  all[key] = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return next;
}
