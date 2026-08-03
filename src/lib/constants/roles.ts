export const USER_ROLES = [
  "OWNER",
  "ADMINISTRATOR",
  "EDITOR",
  "LANGUAGE_REVIEWER",
  "AUDIO_REVIEWER",
  "IMAGE_EDITOR",
  "CONTRIBUTOR",
] as const;

export type UserRoleValue = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRoleValue, string> = {
  OWNER: "Owner",
  ADMINISTRATOR: "Administrator",
  EDITOR: "Editor",
  LANGUAGE_REVIEWER: "Language reviewer",
  AUDIO_REVIEWER: "Audio reviewer",
  IMAGE_EDITOR: "Image editor",
  CONTRIBUTOR: "Contributor",
};

/** Roles that may approve dictionary entries for public visibility. */
export const APPROVER_ROLES: UserRoleValue[] = [
  "OWNER",
  "ADMINISTRATOR",
  "LANGUAGE_REVIEWER",
];

/** Roles that may accept community audio after meticulous review. */
export const AUDIO_REVIEWER_ROLES: UserRoleValue[] = [
  "OWNER",
  "ADMINISTRATOR",
  "LANGUAGE_REVIEWER",
  "AUDIO_REVIEWER",
];

export function isUserRole(value: string): value is UserRoleValue {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function canApproveEntries(role: UserRoleValue): boolean {
  return APPROVER_ROLES.includes(role);
}

export function canEditEntries(role: UserRoleValue): boolean {
  return (
    role === "OWNER" ||
    role === "ADMINISTRATOR" ||
    role === "EDITOR" ||
    role === "LANGUAGE_REVIEWER"
  );
}

export function canReviewAudio(role: UserRoleValue): boolean {
  return AUDIO_REVIEWER_ROLES.includes(role);
}

/** Text/example submissions apply as drafts — editors and approvers may accept. */
export function canAcceptTextSubmissions(role: UserRoleValue): boolean {
  return canEditEntries(role);
}
