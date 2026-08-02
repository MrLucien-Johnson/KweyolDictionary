export type ChildBadgeId =
  | "first-listen"
  | "first-quiz"
  | "category-starter"
  | "spelling-try"
  | "culture-curious"
  | "streak-3";

export type ChildProgress = {
  stars: number;
  badges: ChildBadgeId[];
  listenedSlugs: string[];
  completedActivities: string[];
  completedCategories: string[];
  streakDays: number;
  lastActiveDate: string | null;
};

const STORAGE_KEY = "kweyol-child-progress-v1";

export const EMPTY_PROGRESS: ChildProgress = {
  stars: 0,
  badges: [],
  listenedSlugs: [],
  completedActivities: [],
  completedCategories: [],
  streakDays: 0,
  lastActiveDate: null,
};

export function loadChildProgress(): ChildProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as ChildProgress) };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveChildProgress(progress: ChildProgress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function awardStars(progress: ChildProgress, amount: number): ChildProgress {
  const next = { ...progress, stars: progress.stars + amount };
  const today = todayKey();
  if (progress.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    next.streakDays =
      progress.lastActiveDate === yesterdayKey ? progress.streakDays + 1 : 1;
    next.lastActiveDate = today;
    if (next.streakDays >= 3 && !next.badges.includes("streak-3")) {
      next.badges = [...next.badges, "streak-3"];
    }
  }
  return next;
}

export function markListened(progress: ChildProgress, slug: string): ChildProgress {
  if (progress.listenedSlugs.includes(slug)) return progress;
  let next = awardStars(
    {
      ...progress,
      listenedSlugs: [...progress.listenedSlugs, slug],
    },
    1,
  );
  if (!next.badges.includes("first-listen")) {
    next = { ...next, badges: [...next.badges, "first-listen"] };
  }
  return next;
}

export function markActivityComplete(
  progress: ChildProgress,
  activityId: string,
): ChildProgress {
  if (progress.completedActivities.includes(activityId)) return progress;
  let next = awardStars(
    {
      ...progress,
      completedActivities: [...progress.completedActivities, activityId],
    },
    2,
  );
  if (!next.badges.includes("first-quiz")) {
    next = { ...next, badges: [...next.badges, "first-quiz"] };
  }
  return next;
}

export const BADGE_LABELS: Record<ChildBadgeId, string> = {
  "first-listen": "Listening badge",
  "first-quiz": "Picture quiz badge",
  "category-starter": "Category explorer",
  "spelling-try": "Spelling badge",
  "culture-curious": "Dominican culture badge",
  "streak-3": "Vocabulary streak",
};
