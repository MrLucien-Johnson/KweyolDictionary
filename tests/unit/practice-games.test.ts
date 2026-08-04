import { describe, expect, it } from "vitest";
import {
  buildPracticeGame,
  listPracticeGames,
} from "@/lib/practice/games";
import {
  findHeadwordTokenIndex,
  joinTokens,
  tokenizeSentence,
} from "@/lib/practice/sentence";

describe("practice sentence helpers", () => {
  it("keeps hyphenated Kwéyòl forms together", () => {
    expect(tokenizeSentence("Nou ka manjé pwason jòdi-a.")).toEqual([
      "Nou",
      "ka",
      "manjé",
      "pwason",
      "jòdi-a",
      ".",
    ]);
    expect(joinTokens(["Bonjou", ",", "tout", "moun", "."])).toBe(
      "Bonjou, tout moun.",
    );
  });

  it("finds headwords with accent and article variants", () => {
    expect(
      findHeadwordTokenIndex(tokenizeSentence("Bonjou, kouman ou yé?"), "bonjou"),
    ).toBe(0);
    expect(
      findHeadwordTokenIndex(tokenizeSentence("Mango-a dous."), "mango"),
    ).toBe(0);
  });
});

describe("practice games", () => {
  it("lists adult and child games", () => {
    expect(listPracticeGames().length).toBeGreaterThanOrEqual(6);
    expect(listPracticeGames("CHILD").every((game) => game.audience === "CHILD")).toBe(
      true,
    );
  });

  it("builds cloze and tile rounds from featured words", () => {
    const cloze = buildPracticeGame("featured-sentence-cloze");
    expect(cloze).toBeTruthy();
    expect(cloze!.rounds.length).toBeGreaterThan(0);
    expect(cloze!.rounds[0]?.type).toBe("sentence-cloze");
    if (cloze!.rounds[0]?.type === "sentence-cloze") {
      expect(cloze!.rounds[0].promptSentence).toContain("______");
      expect(cloze!.rounds[0].options).toContain(cloze!.rounds[0].correctOption);
    }

    const tiles = buildPracticeGame("featured-sentence-tiles");
    expect(tiles).toBeTruthy();
    expect(tiles!.rounds[0]?.type).toBe("sentence-tiles");
    if (tiles!.rounds[0]?.type === "sentence-tiles") {
      expect(tiles!.rounds[0].correctTokens.length).toBeGreaterThan(1);
      expect(tiles!.rounds[0].shuffledTokens.length).toBe(
        tiles!.rounds[0].correctTokens.length,
      );
    }
  });
});
