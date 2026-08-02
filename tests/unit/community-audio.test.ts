import { describe, expect, it } from "vitest";
import {
  COMMUNITY_AUDIO_CHECKLIST,
  buildCommunityAudioIssueBody,
  precheckCommunityAudio,
  suggestedCommunityAudioFileName,
} from "@/lib/audio/community-audio";

function validChecklist() {
  return COMMUNITY_AUDIO_CHECKLIST.reduce(
    (acc, item) => {
      acc[item.id] = true;
      return acc;
    },
    {} as Record<(typeof COMMUNITY_AUDIO_CHECKLIST)[number]["id"], boolean>,
  );
}

describe("community audio pre-verification", () => {
  it("rejects submissions that were not listened to or checklist-incomplete", () => {
    const result = precheckCommunityAudio({
      fileName: "bonjou.webm",
      mimeType: "audio/webm",
      byteLength: 12_000,
      durationSeconds: 1.2,
      listened: false,
      checklist: validChecklist(),
      entrySlug: "bonjou",
      kweyolWord: "bonjou",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => /listen/i.test(error))).toBe(true);
  });

  it("accepts a fully pre-verified short recording", () => {
    const result = precheckCommunityAudio({
      fileName: "bonjou.webm",
      mimeType: "audio/webm",
      byteLength: 12_000,
      durationSeconds: 1.2,
      listened: true,
      checklist: validChecklist(),
      entrySlug: "bonjou",
      kweyolWord: "bonjou",
    });
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it("rejects oversized or too-long recordings", () => {
    const oversized = precheckCommunityAudio({
      fileName: "bonjou.webm",
      mimeType: "audio/webm",
      byteLength: 6 * 1024 * 1024,
      durationSeconds: 1,
      listened: true,
      checklist: validChecklist(),
      entrySlug: "bonjou",
      kweyolWord: "bonjou",
    });
    expect(oversized.ok).toBe(false);

    const tooLong = precheckCommunityAudio({
      fileName: "bonjou.webm",
      mimeType: "audio/webm",
      byteLength: 12_000,
      durationSeconds: 20,
      listened: true,
      checklist: validChecklist(),
      entrySlug: "bonjou",
      kweyolWord: "bonjou",
    });
    expect(tooLong.ok).toBe(false);
  });

  it("builds an issue body with maintainer review gates", () => {
    const body = buildCommunityAudioIssueBody({
      entrySlug: "bonjou",
      kweyolWord: "bonjou",
      englishTranslation: "good morning",
      fileName: "bonjou-community.webm",
      mimeType: "audio/webm",
      byteLength: 1000,
      durationSeconds: 1.1,
    });
    expect(body).toContain("Maintainer review");
    expect(body).toContain("remove slug from `tts-manifest.json`");
    expect(suggestedCommunityAudioFileName("bonjou", "audio/webm")).toContain(
      "bonjou-community-",
    );
  });
});
