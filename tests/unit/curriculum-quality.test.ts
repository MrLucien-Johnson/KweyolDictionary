import { describe, expect, it } from "vitest";
import { BEGINNER_CURRICULUM_ENTRIES } from "@/data/beginner-curriculum";

function isFallbackExample(entry: (typeof BEGINNER_CURRICULUM_ENTRIES)[number]) {
  const example = entry.example;
  return (
    example.kweyolText === `${entry.kweyolWord}.` ||
    example.englishText === `${entry.englishTranslation}.`
  );
}

describe("beginner curriculum quality pass", () => {
  it("gives every homonym group related senses and non-fallback examples", () => {
    const homonymWords = [
      "wi",
      "non",
      "sé",
      "li",
      "jaden",
      "pwason",
      "bwa",
      "maché",
      "jwé",
    ];

    for (const word of homonymWords) {
      const group = BEGINNER_CURRICULUM_ENTRIES.filter(
        (entry) => entry.kweyolWord === word,
      );
      expect(group.length).toBeGreaterThan(1);
      for (const entry of group) {
        expect(entry.relatedSlugs?.length ?? 0).toBeGreaterThan(0);
        expect(isFallbackExample(entry)).toBe(false);
        expect(entry.example.kweyolText.includes(" ")).toBe(true);
      }
    }
  });

  it("avoids one-word fallback examples for almost all entries", () => {
    const fallback = BEGINNER_CURRICULUM_ENTRIES.filter(isFallbackExample);
    expect(fallback.length).toBeLessThan(5);
  });

  it("gives featured entries handcrafted or multi-word examples", () => {
    const featured = BEGINNER_CURRICULUM_ENTRIES.filter((entry) => entry.isFeatured);
    expect(featured.length).toBeGreaterThan(20);
    for (const entry of featured) {
      expect(isFallbackExample(entry)).toBe(false);
    }
  });
});
