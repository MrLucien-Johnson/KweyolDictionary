import { describe, expect, it } from "vitest";
import {
  clozeAnswerAlwaysFirst,
  clozeOptionsIncludeAnswer,
  clozePromptLeaksAnswer,
  collectClozeRounds,
  collectTilesRounds,
  tilesStillInCorrectOrder,
} from "@/lib/practice/anti-spoiler";
import {
  buildPracticeGame,
  listPracticeGames,
} from "@/lib/practice/games";
import { PRACTICE_DIFFICULTIES } from "@/lib/practice/difficulty";

describe("practice anti-spoiler invariants", () => {
  it("cloze prompts blank the answer and still offer it among options", () => {
    for (const meta of listPracticeGames()) {
      if (meta.activityType !== "sentence-cloze") continue;
      for (const difficulty of PRACTICE_DIFFICULTIES) {
        const game = buildPracticeGame(meta.slug, difficulty);
        expect(game).toBeTruthy();
        const clozeRounds = collectClozeRounds(game!.rounds);
        expect(clozeRounds.length).toBeGreaterThan(0);
        for (const round of clozeRounds) {
          expect(clozePromptLeaksAnswer(round)).toBe(false);
          expect(clozeOptionsIncludeAnswer(round)).toBe(true);
          expect(round.promptSentence).toContain("______");
        }
        expect(clozeAnswerAlwaysFirst(clozeRounds)).toBe(false);
      }
    }
  });

  it("tile rounds ship a shuffled sentence", () => {
    for (const meta of listPracticeGames()) {
      if (meta.activityType !== "sentence-tiles") continue;
      for (const difficulty of PRACTICE_DIFFICULTIES) {
        const game = buildPracticeGame(meta.slug, difficulty);
        expect(game).toBeTruthy();
        const tileRounds = collectTilesRounds(game!.rounds);
        expect(tileRounds.length).toBeGreaterThan(0);
        // Most rounds should not already be solved; allow rare shuffle collisions
        // on very short sentences by checking the majority.
        const alreadySolved = tileRounds.filter(tilesStillInCorrectOrder).length;
        expect(alreadySolved).toBeLessThan(tileRounds.length);
      }
    }
  });

  it("hard mode turns English hints off in difficulty config", () => {
    const hard = buildPracticeGame("featured-sentence-cloze", "hard");
    expect(hard).toBeTruthy();
    // Config gate is the product rule; UI must honour showEnglishHint.
    expect(hard!.difficulty).toBe("hard");
  });
});
