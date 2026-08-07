import { afterEach, describe, expect, it } from "vitest";
import {
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
} from "@/lib/search/recent";

describe("recent searches", () => {
  afterEach(() => {
    clearRecentSearches();
  });

  it("stores newest first and dedupes case-insensitively", () => {
    pushRecentSearch("bonjou");
    pushRecentSearch("mesi");
    pushRecentSearch("BONJOU");
    expect(getRecentSearches()).toEqual(["BONJOU", "mesi"]);
  });

  it("ignores very short queries", () => {
    pushRecentSearch("a");
    expect(getRecentSearches()).toEqual([]);
  });
});
