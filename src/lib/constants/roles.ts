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
