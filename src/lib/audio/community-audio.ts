/** Shared rules for community native-audio contributions. */

export const COMMUNITY_AUDIO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const COMMUNITY_AUDIO_MIN_SECONDS = 0.35;
export const COMMUNITY_AUDIO_MAX_SECONDS = 12;

export const COMMUNITY_AUDIO_ACCEPT = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
] as const;

export const COMMUNITY_AUDIO_CHECKLIST = [
  {
    id: "dominicanSpeaker",
    label:
      "I speak Dominican Kwéyòl, or I recorded a Dominican Kwéyòl speaker with their permission.",
  },
  {
    id: "humanRecording",
    label: "This is a human recording — not AI, TTS, or browser speech synthesis.",
  },
  {
    id: "matchesWord",
    label: "I listened to my recording and confirmed it matches this dictionary word.",
  },
  {
    id: "usageConsent",
    label:
      "I grant this project permission to review and, if accepted, publish the recording.",
  },
  {
    id: "reviewUnderstood",
    label:
      "I understand editors will re-check the audio carefully before it replaces practice TTS.",
  },
] as const;

export type CommunityAudioChecklistId =
  (typeof COMMUNITY_AUDIO_CHECKLIST)[number]["id"];

export type CommunityAudioPrecheckInput = {
  fileName: string;
  mimeType: string;
  byteLength: number;
  durationSeconds: number | null;
  listened: boolean;
  checklist: Record<CommunityAudioChecklistId, boolean>;
  entrySlug: string;
  kweyolWord: string;
};

export type CommunityAudioPrecheckResult = {
  ok: boolean;
  errors: string[];
};

function normalizeMime(mimeType: string): string {
  return mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function isAllowedCommunityAudioMime(mimeType: string): boolean {
  const mime = normalizeMime(mimeType);
  if ((COMMUNITY_AUDIO_ACCEPT as readonly string[]).includes(mime)) return true;
  // Some browsers omit type on picked files; allow common extensions later in file checks.
  return mime === "";
}

export function isAllowedCommunityAudioFileName(fileName: string): boolean {
  return /\.(mp3|wav|webm|ogg|m4a|aac|mp4)$/i.test(fileName);
}

export function precheckCommunityAudio(
  input: CommunityAudioPrecheckInput,
): CommunityAudioPrecheckResult {
  const errors: string[] = [];

  if (!input.entrySlug.trim()) {
    errors.push("Choose or enter the dictionary entry slug.");
  }
  if (!input.kweyolWord.trim()) {
    errors.push("Enter the Kwéyòl word being recorded.");
  }
  if (!input.fileName.trim()) {
    errors.push("Add a recording or choose an audio file first.");
  }
  if (
    input.mimeType &&
    !isAllowedCommunityAudioMime(input.mimeType) &&
    !isAllowedCommunityAudioFileName(input.fileName)
  ) {
    errors.push("Use MP3, WAV, WEBM, OGG, M4A or AAC audio.");
  }
  if (
    !input.mimeType &&
    input.fileName &&
    !isAllowedCommunityAudioFileName(input.fileName)
  ) {
    errors.push("Use MP3, WAV, WEBM, OGG, M4A or AAC audio.");
  }
  if (input.byteLength <= 0) {
    errors.push("The audio file is empty.");
  }
  if (input.byteLength > COMMUNITY_AUDIO_MAX_BYTES) {
    errors.push("Keep the recording under 5 MB.");
  }
  if (input.durationSeconds == null || Number.isNaN(input.durationSeconds)) {
    errors.push("Could not read audio duration. Try another file or re-record.");
  } else {
    if (input.durationSeconds < COMMUNITY_AUDIO_MIN_SECONDS) {
      errors.push("Recording is too short. Aim for a clear headword pronunciation.");
    }
    if (input.durationSeconds > COMMUNITY_AUDIO_MAX_SECONDS) {
      errors.push("Recording is too long. Keep it to about one clear word or short phrase.");
    }
  }
  if (!input.listened) {
    errors.push("Play back your recording and listen before submitting.");
  }
  for (const item of COMMUNITY_AUDIO_CHECKLIST) {
    if (!input.checklist[item.id]) {
      errors.push(`Confirm: ${item.label}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function buildCommunityAudioIssueBody(input: {
  entrySlug: string;
  kweyolWord: string;
  englishTranslation?: string;
  fileName: string;
  mimeType: string;
  byteLength: number;
  durationSeconds: number | null;
  regionNote?: string;
  submitterNote?: string;
}): string {
  const checklistLines = COMMUNITY_AUDIO_CHECKLIST.map(
    (item) => `- [x] ${item.label}`,
  ).join("\n");

  return [
    "## Native audio submission",
    "",
    `**Entry slug:** \`${input.entrySlug}\``,
    `**Kwéyòl word:** ${input.kweyolWord}`,
    `**English:** ${input.englishTranslation || "(not provided)"}`,
    `**Suggested file name:** \`${input.fileName}\``,
    `**MIME:** ${input.mimeType || "unknown"}`,
    `**Size:** ${input.byteLength} bytes`,
    `**Duration:** ${input.durationSeconds?.toFixed(2) ?? "unknown"} seconds`,
    `**Region / speaker note:** ${input.regionNote?.trim() || "(not provided)"}`,
    "",
    "### Pre-verification completed by submitter",
    checklistLines,
    "- [x] Submitter played back the recording before opening this issue",
    "",
    "### Maintainer review (do not accept until all checked)",
    "- [ ] Opened and listened to the attached recording end-to-end",
    "- [ ] Matches the intended headword / sense (check homonyms)",
    "- [ ] Sounds like natural Dominican Kwéyòl (not French TTS / AI)",
    "- [ ] Audio is clear enough (noise, clipping, speed)",
    "- [ ] Consent / checklist above looks complete",
    "- [ ] Replace `public/audio/{slug}.mp3` and remove slug from `tts-manifest.json`",
    "- [ ] Run `npm run content:publish` and verify UI shows recorded (not synthetic) label",
    "- [ ] Keep status provisional until a second listen confirms quality",
    "",
    "### Note for editors",
    input.submitterNote?.trim() || "_None_",
    "",
    "**Attach the downloaded recording to this issue before submitting.**",
    "",
    "_Submitted from the public contribute flow. Must not go live without review._",
  ].join("\n");
}

export function suggestedCommunityAudioFileName(slug: string, mimeType: string) {
  const ext = (() => {
    const mime = normalizeMime(mimeType);
    if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
    if (mime.includes("wav")) return "wav";
    if (mime.includes("ogg")) return "ogg";
    if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) {
      return "m4a";
    }
    return "webm";
  })();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${slug || "word"}-community-${stamp}.${ext}`;
}
