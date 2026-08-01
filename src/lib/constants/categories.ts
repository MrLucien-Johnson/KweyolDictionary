export type CategoryAudience = "ADULT" | "CHILD" | "BOTH";

export type CategoryDefinition = {
  key: string;
  nameEn: string;
  nameKweyol?: string;
  audience: CategoryAudience;
};

/** Flexible adult topic categories (Phase 2 seed list; extensible via DB). */
export const ADULT_CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { key: "greetings", nameEn: "Greetings", audience: "BOTH" },
  { key: "family", nameEn: "Family", audience: "BOTH" },
  { key: "food-and-drink", nameEn: "Food and drink", audience: "BOTH" },
  { key: "cooking", nameEn: "Cooking", audience: "ADULT" },
  { key: "home", nameEn: "Home", audience: "BOTH" },
  { key: "clothing", nameEn: "Clothing", audience: "BOTH" },
  { key: "colours", nameEn: "Colours", audience: "BOTH" },
  { key: "numbers", nameEn: "Numbers", audience: "BOTH" },
  { key: "days-and-months", nameEn: "Days and months", audience: "ADULT" },
  { key: "time", nameEn: "Time", audience: "ADULT" },
  { key: "weather", nameEn: "Weather", audience: "BOTH" },
  { key: "body", nameEn: "Body", audience: "BOTH" },
  { key: "health", nameEn: "Health", audience: "ADULT" },
  { key: "emotions", nameEn: "Emotions", audience: "BOTH" },
  { key: "school", nameEn: "School", audience: "BOTH" },
  { key: "work", nameEn: "Work", audience: "ADULT" },
  { key: "travel", nameEn: "Travel", audience: "ADULT" },
  { key: "transport", nameEn: "Transport", audience: "BOTH" },
  { key: "nature", nameEn: "Nature", audience: "BOTH" },
  { key: "animals", nameEn: "Animals", audience: "BOTH" },
  { key: "plants", nameEn: "Plants", audience: "ADULT" },
  { key: "farming", nameEn: "Farming", audience: "ADULT" },
  { key: "fishing", nameEn: "Fishing", audience: "ADULT" },
  { key: "construction", nameEn: "Construction", audience: "ADULT" },
  {
    key: "religion-and-spirituality",
    nameEn: "Religion and spirituality",
    audience: "ADULT",
  },
  { key: "music", nameEn: "Music", audience: "BOTH" },
  { key: "dance", nameEn: "Dance", audience: "ADULT" },
  { key: "festivals", nameEn: "Festivals", audience: "ADULT" },
  {
    key: "dominican-culture",
    nameEn: "Dominican culture",
    audience: "BOTH",
  },
  { key: "history", nameEn: "History", audience: "ADULT" },
  {
    key: "traditional-sayings",
    nameEn: "Traditional sayings",
    audience: "ADULT",
  },
  { key: "proverbs", nameEn: "Proverbs", audience: "ADULT" },
  { key: "expressions", nameEn: "Expressions", audience: "ADULT" },
  { key: "verbs", nameEn: "Verbs", audience: "ADULT" },
  { key: "adjectives", nameEn: "Adjectives", audience: "ADULT" },
  { key: "nouns", nameEn: "Nouns", audience: "ADULT" },
  { key: "pronouns", nameEn: "Pronouns", audience: "ADULT" },
  { key: "prepositions", nameEn: "Prepositions", audience: "ADULT" },
  { key: "question-words", nameEn: "Question words", audience: "ADULT" },
  {
    key: "everyday-conversation",
    nameEn: "Everyday conversation",
    audience: "ADULT",
  },
];

/** Image-based children’s categories. */
export const CHILD_CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { key: "animals", nameEn: "Animals", audience: "CHILD" },
  { key: "colours", nameEn: "Colours", audience: "CHILD" },
  { key: "numbers", nameEn: "Numbers", audience: "CHILD" },
  { key: "family", nameEn: "Family", audience: "CHILD" },
  { key: "food", nameEn: "Food", audience: "CHILD" },
  { key: "fruit", nameEn: "Fruit", audience: "CHILD" },
  { key: "vegetables", nameEn: "Vegetables", audience: "CHILD" },
  { key: "body-parts", nameEn: "Body parts", audience: "CHILD" },
  { key: "clothes", nameEn: "Clothes", audience: "CHILD" },
  { key: "school", nameEn: "School", audience: "CHILD" },
  { key: "toys", nameEn: "Toys", audience: "CHILD" },
  { key: "home", nameEn: "Home", audience: "CHILD" },
  { key: "weather", nameEn: "Weather", audience: "CHILD" },
  { key: "nature", nameEn: "Nature", audience: "CHILD" },
  { key: "transport", nameEn: "Transport", audience: "CHILD" },
  { key: "feelings", nameEn: "Feelings", audience: "CHILD" },
  { key: "actions", nameEn: "Actions", audience: "CHILD" },
  { key: "music", nameEn: "Music", audience: "CHILD" },
  { key: "carnival", nameEn: "Carnival", audience: "CHILD" },
  { key: "dominica", nameEn: "Dominica", audience: "CHILD" },
  { key: "sea-life", nameEn: "Sea life", audience: "CHILD" },
  { key: "farm-life", nameEn: "Farm life", audience: "CHILD" },
];

/**
 * Image naming convention:
 * `{category}-{kweyol-slug}-{audienceTag}-{entryShortId}.webp`
 * Example: `animals-chat-kid-0042.webp`
 */
export function buildImageFileName(params: {
  categoryKey: string;
  kweyolSlug: string;
  audienceTag: "adult" | "kid";
  entryShortId: string;
}): string {
  const category = params.categoryKey.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const word = params.kweyolSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const id = params.entryShortId.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${category}-${word}-${params.audienceTag}-${id}.webp`;
}
