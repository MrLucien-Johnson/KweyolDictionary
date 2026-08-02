import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import catalogJson from "@/data/published/catalog.json";
import type { PublishedCatalog } from "@/lib/content/types";

const catalog = catalogJson as PublishedCatalog;

describe("synthetic practice audio", () => {
  it("ships TTS practice audio for every published entry", () => {
    const manifestPath = path.join(process.cwd(), "public", "audio", "tts-manifest.json");
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      voice: string;
      disclaimer: string;
      files: Record<string, unknown>;
    };
    expect(manifest.voice).toContain("fr-");
    expect(manifest.disclaimer.toLowerCase()).toContain("not verified native");
    expect(Object.keys(manifest.files).length).toBe(catalog.entries.length);

    for (const entry of catalog.entries) {
      const audio = entry.audioFiles[0];
      expect(audio).toBeTruthy();
      expect(audio.source).toBe("SYNTHETIC_TTS");
      expect(audio.status).toBe("PLACEHOLDER");
      expect(
        existsSync(path.join(process.cwd(), "public", "audio", `${entry.slug}.mp3`)),
      ).toBe(true);
    }
  });
});
