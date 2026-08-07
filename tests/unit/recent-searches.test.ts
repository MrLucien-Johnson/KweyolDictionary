import { afterEach, describe, expect, it } from "vitest";
import {
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
} from "@/lib/search/recent";

describe("recent searches", () => {
  afterEach(() => {
    clearRecentSearches();
    clearRecentSearches("children");
  });

  it("stores newest first and dedupes case-insensitively", () => {
    pushRecentSearch("bonjou");
    pushRecentSearch("mesi");
    pushRecentSearch("BONJOU");
    expect(getRecentSearches()).toEqual(["BONJOU", "mesi"]);
  });

  it("keeps children recent searches in a separate scope", () => {
    pushRecentSearch("bonjou");
    pushRecentSearch("wouj", "children");
    expect(getRecentSearches()).toEqual(["bonjou"]);
    expect(getRecentSearches("children")).toEqual(["wouj"]);
  });

  it("ignores very short queries", () => {
    pushRecentSearch("a");
    expect(getRecentSearches()).toEqual([]);
  });
});
