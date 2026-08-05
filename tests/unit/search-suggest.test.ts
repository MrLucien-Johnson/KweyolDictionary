import { describe, expect, it } from "vitest";
import { listEntries } from "@/lib/content/catalog";
import { getRelationsForSlug } from "@/data/word-relations";
import { levenshtein, similarityRatio } from "@/lib/search/fuzzy";
import {
  didYouMean,
  findRelatedForQuery,
  findSimilarEntries,
  getLabeledRelationsForEntry,
  suggestEntries,
} from "@/lib/search/suggest";

const catalog = listEntries({});

describe("fuzzy helpers", () => {
  it("computes edit distance and similarity", () => {
    expect(levenshtein("bonjou", "bonjou")).toBe(0);
    expect(levenshtein("bonjo", "bonjou")).toBe(1);
    expect(similarityRatio("bonjo", "bonjou")).toBeGreaterThan(0.8);
  });
});

describe("suggestEntries", () => {
  it("predicts Kwéyòl headwords as you type", () => {
    const hits = suggestEntries("bonj", catalog, 5);
    expect(hits[0]?.slug).toBe("bonjou");
    expect(hits[0]?.matchKind).toMatch(/exact|prefix|contains/);
  });

  it("predicts greeting variants from a shared stem", () => {
    const hits = suggestEntries("bon", catalog, 8);
    expect(hits.some((hit) => hit.slug === "bonjou")).toBe(true);
    expect(hits.some((hit) => hit.slug === "bonswa")).toBe(true);
  });

  it("matches English glosses", () => {
    const hits = suggestEntries("thank", catalog, 5);
    expect(hits.some((hit) => hit.slug === "mesi")).toBe(true);
  });
});

describe("didYouMean", () => {
  it("suggests a correction for a near misspelling", () => {
    const correction = didYouMean("bonxou", catalog);
    expect(correction?.slug).toBe("bonjou");
    expect(correction?.distance).toBeGreaterThan(0);
  });

  it("stays quiet when a strong match already exists", () => {
    expect(didYouMean("bonjou", catalog)).toBeNull();
  });
});

describe("findSimilarEntries", () => {
  it("returns close spellings excluding exact result slugs", () => {
    const similar = findSimilarEntries("gwo", catalog, {
      excludeSlugs: ["gwo"],
      limit: 6,
    });
    expect(similar.every((item) => item.slug !== "gwo")).toBe(true);
    expect(similar.length).toBeGreaterThan(0);
  });
});

describe("word relations", () => {
  it("indexes antonyms in both directions", () => {
    const fromYes = getRelationsForSlug("wi-yes");
    const fromNo = getRelationsForSlug("non-no");
    expect(fromYes.some((row) => row.slug === "non-no" && row.kind === "antonym")).toBe(
      true,
    );
    expect(fromNo.some((row) => row.slug === "wi-yes" && row.kind === "antonym")).toBe(
      true,
    );
  });

  it("surfaces labeled antonyms for a search query", () => {
    const related = findRelatedForQuery("yes", catalog, 8);
    expect(
      related.some(
        (row) => row.slug === "non-no" && row.kind === "antonym",
      ),
    ).toBe(true);

    const fromHeadword = findRelatedForQuery("wi", catalog, 8);
    expect(
      fromHeadword.some(
        (row) => row.slug === "non-no" && row.kind === "antonym",
      ),
    ).toBe(true);
  });

  it("labels relations on a word entry", () => {
    const gwo = catalog.find((entry) => entry.slug === "gwo");
    expect(gwo).toBeTruthy();
    const labeled = getLabeledRelationsForEntry(gwo!, catalog);
    const antonym = labeled.find((row) => row.slug === "piti");
    expect(antonym?.kind).toBe("antonym");
    expect(antonym?.label.toLowerCase()).toContain("antonym");
  });
});
