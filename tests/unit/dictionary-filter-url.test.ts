import { describe, expect, it } from "vitest";
import {
  buildDictionaryHref,
  countActiveDictionaryFilters,
} from "@/lib/dictionary/filter-url";

describe("dictionary filter urls", () => {
  it("builds and clears filter query params", () => {
    expect(
      buildDictionaryHref(
        { q: "bon", category: "greetings" },
        { letter: "b", featured: true },
      ),
    ).toBe("/dictionary?q=bon&letter=b&category=greetings&featured=1");

    expect(
      buildDictionaryHref(
        { q: "bon", letter: "b", featured: true },
        { q: undefined, letter: undefined, featured: false },
      ),
    ).toBe("/dictionary");
  });

  it("counts active filters", () => {
    expect(countActiveDictionaryFilters({ q: "a", featured: true })).toBe(2);
    expect(countActiveDictionaryFilters({})).toBe(0);
  });
});
