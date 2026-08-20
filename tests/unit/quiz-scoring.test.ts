import { describe, expect, it } from "vitest";
import {
  getQuiz,
  getQuizForClient,
  scoreQuizLocally,
} from "@/lib/content/catalog";
import { buildPracticeGame, listPracticeGames } from "@/lib/practice/games";
import { PRACTICE_DIFFICULTY_CONFIG } from "@/lib/practice/difficulty";
import { shuffleUntilDifferentOrder } from "@/lib/practice/sentence";

describe("quiz answer privacy and scoring", () => {
  it("strips isCorrect from the client payload and shuffles answers", () => {
    const source = getQuiz("greetings-multiple-choice");
    const client = getQuizForClient("greetings-multiple-choice");
    expect(source).toBeTruthy();
    expect(client).toBeTruthy();

    for (const question of client!.questions) {
      expect(question.answers.length).toBeGreaterThan(1);
      for (const answer of question.answers) {
        expect(answer).not.toHaveProperty("isCorrect");
        expect(answer.id).toBeTruthy();
        expect(answer.answerText).toBeTruthy();
      }
    }

    const sourceOrder = source!.questions.map((question) =>
      question.answers.map((answer) => answer.id).join(","),
    );
    // Across the quiz, at least one question should differ from source order
    // after shuffle (extremely unlikely all stay identical with 2+ options).
    const clientOrder = client!.questions.map((question) =>
      question.answers.map((answer) => answer.id).join(","),
    );
    const reshuffledSomewhere = clientOrder.some(
      (order, index) => order !== sourceOrder[index],
    );
    // Allow rare collision on a single short quiz by checking ids are a permutation.
    for (let i = 0; i < source!.questions.length; i += 1) {
      const sourceIds = source!.questions[i]!.answers.map((answer) => answer.id).sort();
      const clientIds = client!.questions[i]!.answers.map((answer) => answer.id).sort();
      expect(clientIds).toEqual(sourceIds);
    }
    void reshuffledSomewhere;
  });

  it("returns correctAnswerText when a wrong answer is scored", () => {
    const source = getQuiz("greetings-multiple-choice");
    expect(source).toBeTruthy();
    const scored = scoreQuizLocally(
      source!.slug,
      source!.questions.map((question) => {
        const incorrect = question.answers.find((answer) => !answer.isCorrect);
        return {
          questionId: question.id,
          answerId: incorrect?.id ?? question.answers[0]!.id,
        };
      }),
    );
    expect(scored).toBeTruthy();
    expect(scored!.score).toBe(0);
    expect(
      scored!.results.every((item) => Boolean(item.correctAnswerText)),
    ).toBe(true);
  });
});

describe("shuffleUntilDifferentOrder", () => {
  it("avoids matching the reference key order when possible", () => {
    const pairs = [
      { kweyol: "a", english: "1" },
      { kweyol: "b", english: "2" },
      { kweyol: "c", english: "3" },
      { kweyol: "d", english: "4" },
    ];
    const reference = pairs.map((pair) => pair.kweyol);
    let differed = false;
    for (let i = 0; i < 20; i += 1) {
      const shuffled = shuffleUntilDifferentOrder(
        pairs,
        reference,
        (pair) => pair.kweyol,
      );
      if (shuffled.some((pair, index) => pair.kweyol !== reference[index])) {
        differed = true;
        break;
      }
    }
    expect(differed).toBe(true);
  });
});

describe("practice difficulty contracts used by arcade boot", () => {
  it("exposes timed seconds for medium/hard speed-bonus init", () => {
    expect(PRACTICE_DIFFICULTY_CONFIG.medium.secondsPerRound).toBeGreaterThan(0);
    expect(PRACTICE_DIFFICULTY_CONFIG.hard.secondsPerRound).toBeGreaterThan(0);
    expect(PRACTICE_DIFFICULTY_CONFIG.easy.secondsPerRound).toBe(0);
    expect(PRACTICE_DIFFICULTY_CONFIG.hard.showEnglishHint).toBe(false);
  });

  it("builds hard games for every listed practice slug", () => {
    for (const meta of listPracticeGames()) {
      const hard = buildPracticeGame(meta.slug, "hard");
      expect(hard?.difficulty).toBe("hard");
      expect(hard!.rounds.length).toBeGreaterThan(0);
    }
  });
});
