import { normalizeSearchText } from "@/lib/search/normalize";
import type { ClozeRound, PracticeRound, TilesRound } from "@/lib/practice/games";

/**
 * Anti-spoiler checks for practice rounds.
 * Keep these in sync with docs/PRACTICE_GAMES_VET.md.
 */

export function clozePromptLeaksAnswer(round: ClozeRound): boolean {
  const blanked = normalizeSearchText(round.promptSentence);
  const answer = normalizeSearchText(round.correctOption);
  if (!answer) return false;
  // Blanked sentence must not still contain the full answer token.
  const tokens = blanked.split(/\s+/).filter(Boolean);
  return tokens.some((token) => token === answer);
}

export function clozeOptionsIncludeAnswer(round: ClozeRound): boolean {
  return round.options.some(
    (option) =>
      normalizeSearchText(option) === normalizeSearchText(round.correctOption),
  );
}

/** Correct choice must not always sit in the same option slot. */
export function clozeAnswerAlwaysFirst(rounds: ClozeRound[]): boolean {
  if (rounds.length < 3) return false;
  return rounds.every((round) => round.options[0] === round.correctOption);
}

export function tilesStillInCorrectOrder(round: TilesRound): boolean {
  return (
    round.shuffledTokens.length === round.correctTokens.length &&
    round.shuffledTokens.every(
      (token, index) => token === round.correctTokens[index],
    )
  );
}

export function collectClozeRounds(rounds: PracticeRound[]): ClozeRound[] {
  return rounds.filter((round): round is ClozeRound => round.type === "sentence-cloze");
}

export function collectTilesRounds(rounds: PracticeRound[]): TilesRound[] {
  return rounds.filter((round): round is TilesRound => round.type === "sentence-tiles");
}
