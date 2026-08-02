export const REVIEW_STATUSES = [
  "DRAFT",
  "NEEDS_REVIEW",
  "LINGUIST_REVIEWED",
  "COMMUNITY_REVIEWED",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
] as const;

export type ReviewStatusValue = (typeof REVIEW_STATUSES)[number];

/** Statuses that may appear in the public dictionary by default. */
export const PUBLIC_VISIBLE_REVIEW_STATUSES: ReviewStatusValue[] = [
  "APPROVED",
];

export const REVIEW_STATUS_LABELS: Record<ReviewStatusValue, string> = {
  DRAFT: "Draft",
  NEEDS_REVIEW: "Needs review",
  LINGUIST_REVIEWED: "Linguist reviewed",
  COMMUNITY_REVIEWED: "Community reviewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

export function isPubliclyVisibleStatus(
  status: ReviewStatusValue,
): boolean {
  return PUBLIC_VISIBLE_REVIEW_STATUSES.includes(status);
}
