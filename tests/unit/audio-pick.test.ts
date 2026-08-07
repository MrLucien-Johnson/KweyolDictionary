import { describe, expect, it } from "vitest";
import {
  audioListenLabel,
  needsNativeAudio,
  pickPlayableAudio,
} from "@/lib/audio/pick";

describe("pickPlayableAudio", () => {
  it("prefers RECORDED over SYNTHETIC_TTS", () => {
    const audio = pickPlayableAudio({
      audioFiles: [
        {
          id: "tts",
          filePath: "/audio/bonjou.mp3",
          status: "PLACEHOLDER",
          source: "SYNTHETIC_TTS",
          voice: "fr-FR-DeniseNeural",
        },
        {
          id: "native",
          filePath: "/audio/bonjou-community.mp3",
          status: "PLACEHOLDER",
          source: "RECORDED",
          voice: null,
        },
      ],
    });
    expect(audio?.source).toBe("RECORDED");
    expect(audio?.filePath).toBe("/audio/bonjou-community.mp3");
  });

  it("ignores MISSING files", () => {
    expect(
      pickPlayableAudio({
        audioFiles: [
          {
            id: "missing",
            filePath: "/audio/x.mp3",
            status: "MISSING",
            source: "RECORDED",
            voice: null,
          },
        ],
      }),
    ).toBeNull();
  });

  it("falls back to synthetic practice audio", () => {
    const audio = pickPlayableAudio({
      audioFiles: [
        {
          id: "tts",
          filePath: "/audio/bonjou.mp3",
          status: "PLACEHOLDER",
          source: "SYNTHETIC_TTS",
          voice: "fr-FR-DeniseNeural",
        },
      ],
    });
    expect(audio?.source).toBe("SYNTHETIC_TTS");
  });
});

describe("needsNativeAudio", () => {
  it("is true when only synthetic TTS exists", () => {
    expect(
      needsNativeAudio({
        audioFiles: [
          {
            id: "tts",
            filePath: "/audio/bonjou.mp3",
            status: "PLACEHOLDER",
            source: "SYNTHETIC_TTS",
            voice: null,
          },
        ],
      }),
    ).toBe(true);
  });

  it("is false when a community recording is available", () => {
    expect(
      needsNativeAudio({
        audioFiles: [
          {
            id: "rec",
            filePath: "/audio/bonjou.mp3",
            status: "PLACEHOLDER",
            source: "RECORDED",
            voice: null,
          },
        ],
      }),
    ).toBe(false);
  });
});

describe("audioListenLabel", () => {
  it("labels synthetic and community sources distinctly", () => {
    expect(audioListenLabel("bonjou", "SYNTHETIC_TTS")).toMatch(/practice/i);
    expect(audioListenLabel("bonjou", "RECORDED")).toMatch(/community/i);
  });
});
