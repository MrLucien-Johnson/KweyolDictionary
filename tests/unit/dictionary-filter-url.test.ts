import { describe, expect, it } from "vitest";
import {
  buildDictionaryHref,
  countActiveDictionaryFilters,
  needsHardDictionaryNavigation,
  withBasePath,
} from "@/lib/dictionary/filter-url";

describe("dictionary filter urls", () => {
  it("builds and clears filter query params with trailing slash", () => {
    expect(
      buildDictionaryHref(
        { q: "bon", category: "greetings" },
        { letter: "b", featured: true },
      ),
    ).toBe("/dictionary/?q=bon&letter=b&category=greetings&featured=1");

    expect(
      buildDictionaryHref(
        { q: "bon", letter: "b", featured: true },
        { q: undefined, letter: undefined, featured: false },
      ),
    ).toBe("/dictionary/");
  });

  it("strips falsey filter flags left on the current state", () => {
    expect(
      buildDictionaryHref(
        {
          letter: "s",
          hasAudio: false,
          featured: false,
        },
        { letter: undefined },
      ),
    ).toBe("/dictionary/");
  });

  it("counts active filters", () => {
    expect(countActiveDictionaryFilters({ q: "a", featured: true })).toBe(2);
    expect(countActiveDictionaryFilters({ hasAudio: false })).toBe(0);
    expect(countActiveDictionaryFilters({})).toBe(0);
  });

  it("detects when clearing query needs a hard navigation", () => {
    expect(needsHardDictionaryNavigation("?letter=s", "/dictionary/")).toBe(
      true,
    );
    expect(
      needsHardDictionaryNavigation("?letter=s", "/dictionary/?letter=a"),
    ).toBe(false);
    expect(needsHardDictionaryNavigation("", "/dictionary/")).toBe(false);
  });

  it("prefixes the Pages base path", () => {
    const previous = process.env.NEXT_PUBLIC_BASE_PATH;
    process.env.NEXT_PUBLIC_BASE_PATH = "/KweyolDictionary";
    expect(withBasePath("/dictionary/")).toBe("/KweyolDictionary/dictionary/");
    process.env.NEXT_PUBLIC_BASE_PATH = previous;
  });
});
