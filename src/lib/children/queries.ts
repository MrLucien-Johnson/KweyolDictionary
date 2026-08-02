import {
  getActivity,
  getChildEntry,
  listActivities,
  listChildCategories,
  listChildEntries,
} from "@/lib/content/catalog";

export async function listChildCategoriesView() {
  return listChildCategories();
}

export async function listChildWords(options?: {
  category?: string;
  ageBand?: string;
}) {
  return listChildEntries(options);
}

export async function getChildWord(slug: string) {
  return getChildEntry(slug) ?? null;
}

export async function listChildActivities(options?: {
  category?: string;
  ageBand?: string;
}) {
  return listActivities(options).map((activity, index) => ({
    id: `${activity.slug}-${index}`,
    ...activity,
  }));
}

export async function getChildActivity(slug: string) {
  const activity = getActivity(slug);
  if (!activity) return null;
  return { id: activity.slug, ...activity };
}

// Back-compat names
export { listChildCategoriesView as listChildCategories };
