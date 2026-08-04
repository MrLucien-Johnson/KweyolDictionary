import { describe, expect, it } from "vitest";
import {
  PRACTICE_DIFFICULTY_CONFIG,
  parsePracticeDifficulty,
  scoreRoundPoints,
  starRating,
} from "@/lib/practice/difficulty";
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

describe("practice difficulty", () => {
  it("parses difficulty levels", () => {
    expect(parsePracticeDifficulty("hard")).toBe("hard");
    expect(parsePracticeDifficulty("nope")).toBeNull();
    expect(PRACTICE_DIFFICULTY_CONFIG.easy.showEnglishHint).toBe(true);
    expect(PRACTICE_DIFFICULTY_CONFIG.hard.showEnglishHint).toBe(false);
  });

  it("scores streaks and speed", () => {
    expect(
      scoreRoundPoints({
        difficulty: "medium",
        streakAfterCorrect: 3,
        secondsLeft: 10,
        secondsPerRound: 20,
      }),
    ).toBeGreaterThan(PRACTICE_DIFFICULTY_CONFIG.medium.basePoints);
    expect(starRating(90, 100)).toBe(3);
    expect(starRating(20, 100)).toBe(1);
  });
});

describe("practice games", () => {
  it("lists adult and child games", () => {
    expect(listPracticeGames().length).toBeGreaterThanOrEqual(6);
    expect(listPracticeGames("CHILD").every((game) => game.audience === "CHILD")).toBe(
      true,
    );
  });

  it("builds harder cloze rounds with more distractors", () => {
    const easy = buildPracticeGame("featured-sentence-cloze", "easy");
    const hard = buildPracticeGame("featured-sentence-cloze", "hard");
    expect(easy?.difficulty).toBe("easy");
    expect(hard?.difficulty).toBe("hard");
    expect(easy!.rounds.length).toBeGreaterThan(0);
    if (easy!.rounds[0]?.type === "sentence-cloze") {
      expect(easy!.rounds[0].options.length).toBe(3);
    }
    if (hard!.rounds[0]?.type === "sentence-cloze") {
      expect(hard!.rounds[0].options.length).toBe(5);
    }
  });
});
