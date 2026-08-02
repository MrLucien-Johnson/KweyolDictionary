export const CHILD_AGE_BANDS = [
  "EARLY_4_6",
  "GROWING_7_9",
  "CONFIDENT_10_12",
] as const;

export type ChildAgeBandValue = (typeof CHILD_AGE_BANDS)[number];

export const CHILD_AGE_BAND_LABELS: Record<
  ChildAgeBandValue,
  { label: string; ages: string }
> = {
  EARLY_4_6: { label: "Early learners", ages: "4–6" },
  GROWING_7_9: { label: "Growing learners", ages: "7–9" },
  CONFIDENT_10_12: { label: "Confident learners", ages: "10–12" },
};

export const DIFFICULTY_LEVELS = [
  "BEGINNER",
  "ELEMENTARY",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

export type DifficultyLevelValue = (typeof DIFFICULTY_LEVELS)[number];
