"use client";

import Link from "next/link";
import { useState } from "react";
import { AudioButton } from "@/components/dictionary/AudioButton";
import { getEntry } from "@/lib/content/catalog";
import type { PracticeGame, PracticeRound } from "@/lib/practice/games";
import { joinTokens } from "@/lib/practice/sentence";

type PracticeGamePlayerProps = {
  game: PracticeGame;
};

type RoundUiState = {
  selected: string | null;
  tilePicks: string[];
  remainingTiles: string[];
  checked: boolean;
};

function audioFor(slug: string) {
  const entry = getEntry(slug);
  return entry?.audioFiles.find((file) => file.status !== "MISSING")?.filePath;
}

function initialUiForRound(round: PracticeRound | undefined): RoundUiState {
  if (round?.type === "sentence-tiles") {
    return {
      selected: null,
      tilePicks: [],
      remainingTiles: [...round.shuffledTokens],
      checked: false,
    };
  }
  return {
    selected: null,
    tilePicks: [],
    remainingTiles: [],
    checked: false,
  };
}

export function PracticeGamePlayer({ game }: PracticeGamePlayerProps) {
  const [index, setIndex] = useState(0);
  const [ui, setUi] = useState<RoundUiState>(() =>
    initialUiForRound(game.rounds[0]),
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = game.rounds[index];
  const total = game.rounds.length;
  const isKids = game.audience === "CHILD";

  function goToRound(nextIndex: number) {
    setIndex(nextIndex);
    setUi(initialUiForRound(game.rounds[nextIndex]));
  }

  if (!round) {
    return (
      <div className="empty-state">
        <h2>No rounds available</h2>
        <p>Try another practice game.</p>
      </div>
    );
  }

  const currentRound = round;

  const isCorrect =
    currentRound.type === "sentence-cloze"
      ? ui.selected === currentRound.correctOption
      : joinTokens(ui.tilePicks) === joinTokens(currentRound.correctTokens);

  function checkAnswer() {
    if (ui.checked) return;
    const ok =
      currentRound.type === "sentence-cloze"
        ? ui.selected === currentRound.correctOption
        : joinTokens(ui.tilePicks) === joinTokens(currentRound.correctTokens);
    setUi((current) => ({ ...current, checked: true }));
    if (ok) setCorrectCount((count) => count + 1);
  }

  function goNext() {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    goToRound(index + 1);
  }

  function restart() {
    setCorrectCount(0);
    setFinished(false);
    goToRound(0);
  }

  if (finished) {
    return (
      <div className={`practice-player ${isKids ? "practice-player--kids" : ""}`}>
        <h1>{game.title}</h1>
        <div className="practice-player__result">
          <p className="practice-player__score">
            You got <strong>{correctCount}</strong> of <strong>{total}</strong>{" "}
            sentences right.
          </p>
          <p className="section-lead">
            {correctCount === total
              ? "Excellent — try another game or revisit the dictionary examples."
              : "Replay to strengthen the sentences, or open the word pages for more context."}
          </p>
          <div className="practice-player__actions">
            <button type="button" className="btn btn--primary btn--md" onClick={restart}>
              Play again
            </button>
            <Link href="/practice" className="btn btn--soft btn--md">
              More practice games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const audioSrc = audioFor(currentRound.entrySlug);

  return (
    <div className={`practice-player ${isKids ? "practice-player--kids" : ""}`}>
      <header className="practice-player__header">
        <p className="practice-player__eyebrow">
          {isKids ? "Kids practice" : "Sentence practice"} · {index + 1} / {total}
        </p>
        <h1>{game.title}</h1>
        <p className="section-lead">{game.description}</p>
      </header>

      <div className="practice-player__progress" aria-hidden="true">
        <span
          style={{ width: `${((index + (ui.checked ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <section className="practice-player__round" aria-live="polite">
        <div className="practice-player__word-row">
          <p className="practice-player__target">
            Focus word: <strong>{currentRound.headword}</strong>
            <span className="practice-player__gloss"> · {currentRound.english}</span>
          </p>
          {audioSrc ? (
            <AudioButton
              src={audioSrc}
              label={`Play ${currentRound.headword}`}
              variant="icon"
            />
          ) : null}
        </div>

        {currentRound.type === "sentence-cloze" ? (
          <>
            <p className="practice-player__prompt">{currentRound.promptSentence}</p>
            <p className="practice-player__hint">{currentRound.englishHint}</p>
            <div
              className="practice-player__options"
              role="group"
              aria-label="Word choices"
            >
              {currentRound.options.map((option) => {
                const showState = ui.checked;
                const isAnswer = option === currentRound.correctOption;
                const isChosen = option === ui.selected;
                let className = "practice-player__option";
                if (showState && isAnswer) className += " is-correct";
                if (showState && isChosen && !isAnswer) className += " is-wrong";
                if (!showState && isChosen) className += " is-selected";
                return (
                  <button
                    key={option}
                    type="button"
                    className={className}
                    disabled={ui.checked}
                    onClick={() =>
                      setUi((current) => ({ ...current, selected: option }))
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="practice-player__hint">English: {currentRound.englishHint}</p>
            <div className="practice-player__built" aria-label="Your sentence">
              {ui.tilePicks.length
                ? joinTokens(ui.tilePicks)
                : "Tap words below to build the sentence…"}
            </div>
            <div
              className="practice-player__tiles"
              role="group"
              aria-label="Word tiles"
            >
              {ui.remainingTiles.map((token, tokenIndex) => (
                <button
                  key={`${token}-${tokenIndex}-${ui.remainingTiles.length}`}
                  type="button"
                  className="practice-player__tile"
                  disabled={ui.checked}
                  onClick={() => {
                    setUi((current) => ({
                      ...current,
                      tilePicks: [...current.tilePicks, token],
                      remainingTiles: current.remainingTiles.filter(
                        (_, i) => i !== tokenIndex,
                      ),
                    }));
                  }}
                >
                  {token}
                </button>
              ))}
            </div>
            {!ui.checked ? (
              <div className="practice-player__tile-tools">
                <button
                  type="button"
                  className="btn btn--soft btn--md"
                  onClick={() => {
                    setUi((current) => {
                      if (!current.tilePicks.length) return current;
                      const last = current.tilePicks[current.tilePicks.length - 1];
                      return {
                        ...current,
                        tilePicks: current.tilePicks.slice(0, -1),
                        remainingTiles: [...current.remainingTiles, last],
                      };
                    });
                  }}
                >
                  Undo
                </button>
                <button
                  type="button"
                  className="btn btn--soft btn--md"
                  onClick={() => setUi(initialUiForRound(currentRound))}
                >
                  Reset
                </button>
              </div>
            ) : null}
          </>
        )}

        {ui.checked ? (
          <p
            className={`practice-player__feedback ${isCorrect ? "is-correct" : "is-wrong"}`}
          >
            {currentRound.type === "sentence-cloze"
              ? isCorrect
                ? "Correct — nice sentence work."
                : `The missing word is “${currentRound.correctOption}”.`
              : isCorrect
                ? "Well done — that sentence is correct."
                : `Almost — the sentence is: ${joinTokens(currentRound.correctTokens)}`}
          </p>
        ) : null}
      </section>

      <div className="practice-player__actions">
        {!ui.checked ? (
          <button
            type="button"
            className="btn btn--primary btn--md"
            disabled={
              currentRound.type === "sentence-cloze"
                ? !ui.selected
                : ui.tilePicks.length !== currentRound.correctTokens.length
            }
            onClick={checkAnswer}
          >
            Check
          </button>
        ) : (
          <button type="button" className="btn btn--primary btn--md" onClick={goNext}>
            {index + 1 >= total ? "See results" : "Next sentence"}
          </button>
        )}
        <Link
          href={`/dictionary/${currentRound.entrySlug}`}
          className="btn btn--soft btn--md"
        >
          Open word
        </Link>
      </div>
    </div>
  );
}
