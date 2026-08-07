"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AudioButton } from "@/components/dictionary/AudioButton";
import { pickPlayableAudio } from "@/lib/audio/pick";
import { getEntry } from "@/lib/content/catalog";
import {
  PRACTICE_DIFFICULTIES,
  PRACTICE_DIFFICULTY_CONFIG,
  parsePracticeDifficulty,
  scoreRoundPoints,
  starRating,
  type PracticeDifficulty,
} from "@/lib/practice/difficulty";
import {
  buildPracticeGame,
  getPracticeGameMeta,
  type PracticeGame,
  type PracticeRound,
} from "@/lib/practice/games";
import {
  readPracticeHighScore,
  savePracticeHighScore,
} from "@/lib/practice/high-scores";
import { joinTokens } from "@/lib/practice/sentence";
import { ArcadeTimer } from "@/components/practice/ArcadeTimer";
import { addFavouriteSlugs } from "@/lib/favourites/storage";

type PracticeArcadeProps = {
  slug: string;
};

type RoundUiState = {
  selected: string | null;
  tilePicks: string[];
  remainingTiles: string[];
  checked: boolean;
  timedOut: boolean;
};

type FloatScore = { id: number; text: string };

function audioFor(entrySlug: string) {
  return pickPlayableAudio(getEntry(entrySlug))?.filePath;
}

function initialUiForRound(round: PracticeRound | undefined): RoundUiState {
  if (round?.type === "sentence-tiles") {
    return {
      selected: null,
      tilePicks: [],
      remainingTiles: [...round.shuffledTokens],
      checked: false,
      timedOut: false,
    };
  }
  return {
    selected: null,
    tilePicks: [],
    remainingTiles: [],
    checked: false,
    timedOut: false,
  };
}

export function PracticeArcade({ slug }: PracticeArcadeProps) {
  const meta = getPracticeGameMeta(slug);
  const searchParams = useSearchParams();
  const urlDifficulty = parsePracticeDifficulty(searchParams.get("difficulty"));

  const [difficulty, setDifficulty] = useState<PracticeDifficulty>(
    urlDifficulty ?? (meta?.audience === "CHILD" ? "easy" : "medium"),
  );
  const [phase, setPhase] = useState<"lobby" | "play" | "results">(
    urlDifficulty ? "play" : "lobby",
  );
  const [game, setGame] = useState<PracticeGame | null>(() =>
    urlDifficulty ? buildPracticeGame(slug, urlDifficulty) : null,
  );
  const [index, setIndex] = useState(0);
  const [ui, setUi] = useState<RoundUiState>(() =>
    initialUiForRound(
      urlDifficulty
        ? buildPracticeGame(slug, urlDifficulty)?.rounds[0]
        : undefined,
    ),
  );
  const [lives, setLives] = useState(
    PRACTICE_DIFFICULTY_CONFIG[
      urlDifficulty ?? (meta?.audience === "CHILD" ? "easy" : "medium")
    ].lives,
  );
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [floatScores, setFloatScores] = useState<FloatScore[]>([]);
  const [pulse, setPulse] = useState<"ok" | "bad" | null>(null);
  const [scoreBoardTick, setScoreBoardTick] = useState(0);
  const floatId = useRef(0);
  const resolving = useRef(false);

  const config = PRACTICE_DIFFICULTY_CONFIG[difficulty];
  const isKids = meta?.audience === "CHILD";
  const accent = meta?.accent ?? "leaf";
  const highScore = readPracticeHighScore(slug, difficulty)?.score ?? null;
  // scoreBoardTick forces a re-read after saves
  void scoreBoardTick;

  const round = game?.rounds[index];
  const total = game?.rounds.length ?? 0;

  const maxPossible = useMemo(() => {
    if (!game) return 0;
    let running = 0;
    let streakHypothetical = 0;
    for (let i = 0; i < game.rounds.length; i += 1) {
      streakHypothetical += 1;
      running += scoreRoundPoints({
        difficulty,
        streakAfterCorrect: streakHypothetical,
        secondsLeft: config.secondsPerRound,
        secondsPerRound: config.secondsPerRound,
      });
    }
    return running;
  }, [game, difficulty, config.secondsPerRound]);

  function pushFloat(text: string) {
    floatId.current += 1;
    const id = floatId.current;
    setFloatScores((current) => [...current, { id, text }]);
    window.setTimeout(() => {
      setFloatScores((current) => current.filter((item) => item.id !== id));
    }, 900);
  }

  function startRun(nextDifficulty: PracticeDifficulty) {
    const built = buildPracticeGame(slug, nextDifficulty);
    if (!built) return;
    setDifficulty(nextDifficulty);
    setGame(built);
    setIndex(0);
    setUi(initialUiForRound(built.rounds[0]));
    setLives(PRACTICE_DIFFICULTY_CONFIG[nextDifficulty].lives);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setPulse(null);
    setSecondsLeft(
      PRACTICE_DIFFICULTY_CONFIG[nextDifficulty].secondsPerRound || null,
    );
    resolving.current = false;
    setPhase("play");
    const url = new URL(window.location.href);
    url.searchParams.set("difficulty", nextDifficulty);
    window.history.replaceState({}, "", url.toString());
  }

  function goToRound(nextIndex: number, nextGame = game) {
    if (!nextGame) return;
    setIndex(nextIndex);
    setUi(initialUiForRound(nextGame.rounds[nextIndex]));
    resolving.current = false;
    setPulse(null);
    setSecondsLeft(config.secondsPerRound || null);
  }

  function finishRun(finalScore: number, stars: number) {
    savePracticeHighScore({
      slug,
      difficulty,
      score: finalScore,
      stars,
    });
    setScoreBoardTick((value) => value + 1);
    setPhase("results");
  }

  function resolveRound(ok: boolean, timedOut = false) {
    if (!game || !round || resolving.current || ui.checked) return;
    resolving.current = true;

    const secondsPerRound = config.secondsPerRound;
    let nextScore = score;
    let nextStreak = streak;
    let nextLives = lives;
    let nextCorrect = correctCount;
    let nextBest = bestStreak;

    if (ok) {
      nextStreak += 1;
      nextBest = Math.max(nextBest, nextStreak);
      nextCorrect += 1;
      const gained = scoreRoundPoints({
        difficulty,
        streakAfterCorrect: nextStreak,
        secondsLeft,
        secondsPerRound,
      });
      nextScore += gained;
      pushFloat(`+${gained}`);
      setPulse("ok");
    } else {
      nextStreak = 0;
      nextLives -= 1;
      setPulse("bad");
      pushFloat(timedOut ? "Time!" : "Oops");
    }

    setScore(nextScore);
    setStreak(nextStreak);
    setBestStreak(nextBest);
    setCorrectCount(nextCorrect);
    setLives(nextLives);
    setUi((current) => ({ ...current, checked: true, timedOut }));

    window.setTimeout(() => {
      const stars = starRating(nextScore, Math.max(maxPossible, nextScore));
      if (nextLives <= 0 || index + 1 >= game.rounds.length) {
        finishRun(nextScore, stars);
        return;
      }
      goToRound(index + 1, game);
    }, ok ? 650 : 900);
  }

  function onClozePick(option: string) {
    if (!round || round.type !== "sentence-cloze" || ui.checked) return;
    setUi((current) => ({ ...current, selected: option }));
    resolveRound(option === round.correctOption);
  }

  function tryAutoCheckTiles(nextPicks: string[], correctTokens: string[]) {
    if (nextPicks.length !== correctTokens.length) return;
    resolveRound(joinTokens(nextPicks) === joinTokens(correctTokens));
  }

  if (!meta) {
    return (
      <div className="empty-state">
        <h2>Game not found</h2>
        <Link href="/practice" className="btn btn--soft btn--md">
          Back to practice
        </Link>
      </div>
    );
  }

  if (phase === "lobby") {
    return (
      <div className={`arcade-shell arcade-shell--${accent} ${isKids ? "arcade-shell--kids" : ""}`}>
        <div className="arcade-lobby">
          <p className="arcade-lobby__eyebrow">Mini game</p>
          <h1>{meta.title}</h1>
          <p className="section-lead">{meta.description}</p>
          <p className="arcade-lobby__mode">
            {meta.activityType === "sentence-cloze"
              ? "Tap the missing word"
              : "Build the sentence from tiles"}
          </p>
          {highScore != null ? (
            <p className="arcade-lobby__best">
              Best on {PRACTICE_DIFFICULTY_CONFIG[difficulty].label}: {highScore}
            </p>
          ) : null}
          <div className="arcade-difficulty" role="group" aria-label="Difficulty">
            {PRACTICE_DIFFICULTIES.map((level) => {
              const levelConfig = PRACTICE_DIFFICULTY_CONFIG[level];
              const best = readPracticeHighScore(slug, level)?.score;
              return (
                <button
                  key={level}
                  type="button"
                  className={
                    difficulty === level
                      ? "arcade-difficulty__card is-active"
                      : "arcade-difficulty__card"
                  }
                  onClick={() => {
                    setDifficulty(level);
                    setScoreBoardTick((value) => value + 1);
                  }}
                >
                  <span className="arcade-difficulty__label">{levelConfig.label}</span>
                  <span className="arcade-difficulty__blurb">{levelConfig.blurb}</span>
                  {best != null ? (
                    <span className="arcade-difficulty__best">Best {best}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="arcade-lobby__actions">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => startRun(difficulty)}
            >
              Start {PRACTICE_DIFFICULTY_CONFIG[difficulty].label}
            </button>
            <Link href="/practice" className="btn btn--soft btn--md">
              All games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" && game) {
    const stars = starRating(score, Math.max(maxPossible, score));
    const reviewed = Array.from(
      new Map(
        game.rounds.map((item) => [
          item.entrySlug,
          { slug: item.entrySlug, headword: item.headword, english: item.english },
        ]),
      ).values(),
    );
    const endedEarly = lives <= 0 && index < total - 1;
    return (
      <div className={`arcade-shell arcade-shell--${accent} ${isKids ? "arcade-shell--kids" : ""}`}>
        <div className="arcade-results">
          <p className="arcade-lobby__eyebrow">
            {endedEarly ? "Out of lives" : "Run complete"}
          </p>
          <h1>{meta.title}</h1>
          <div className="arcade-stars" aria-label={`${stars} stars`}>
            {[1, 2, 3].map((value) => (
              <span
                key={value}
                className={value <= stars ? "arcade-star is-on" : "arcade-star"}
              />
            ))}
          </div>
          <p className="arcade-results__score">{score} pts</p>
          <p className="section-lead">
            {correctCount}/{total} sentences · best streak {bestStreak} ·{" "}
            {PRACTICE_DIFFICULTY_CONFIG[difficulty].label}
          </p>
          {highScore != null ? (
            <p className="arcade-lobby__best">High score: {highScore}</p>
          ) : null}

          {reviewed.length ? (
            <section className="arcade-results__review" aria-label="Words to review">
              <h2>Words from this run</h2>
              <ul className="arcade-results__words">
                {reviewed.map((word) => (
                  <li key={word.slug}>
                    <Link href={`/dictionary/${word.slug}`}>
                      {word.headword}
                    </Link>
                    <span> — {word.english}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn--soft btn--md"
                onClick={() => {
                  addFavouriteSlugs(reviewed.map((word) => word.slug));
                }}
              >
                Save these words to favourites
              </button>
            </section>
          ) : null}

          <div className="arcade-lobby__actions">
            <button
              type="button"
              className="btn btn--primary btn--md"
              onClick={() => startRun(difficulty)}
            >
              Play again
            </button>
            <button
              type="button"
              className="btn btn--soft btn--md"
              onClick={() => setPhase("lobby")}
            >
              Change difficulty
            </button>
            <Link href="/practice" className="btn btn--soft btn--md">
              More games
            </Link>
            <Link
              href={isKids ? "/children/" : "/dictionary/"}
              className="btn btn--soft btn--md"
            >
              {isKids ? "Children’s dictionary" : "Browse dictionary"}
            </Link>
            <Link href="/dictionary/favourites" className="btn btn--soft btn--md">
              Favourites
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!game || !round) {
    return (
      <div className="empty-state">
        <h2>Could not start this game</h2>
        <button type="button" className="btn btn--soft btn--md" onClick={() => setPhase("lobby")}>
          Back
        </button>
      </div>
    );
  }

  const currentRound = round;
  const audioSrc = audioFor(currentRound.entrySlug);

  return (
    <div
      className={`arcade-shell arcade-shell--${accent} ${isKids ? "arcade-shell--kids" : ""} ${pulse ? `is-pulse-${pulse}` : ""}`}
    >
      <div className="arcade-hud" aria-live="polite">
        <div className="arcade-hud__stat">
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div className="arcade-hud__stat">
          <span>Streak</span>
          <strong>{streak}</strong>
        </div>
        <div className="arcade-hud__stat">
          <span>Lives</span>
          <strong className="arcade-hud__lives">
            {Array.from({ length: config.lives }, (_, lifeIndex) => (
              <i
                key={lifeIndex}
                className={lifeIndex < lives ? "is-on" : ""}
                aria-hidden="true"
              />
            ))}
            <span className="sr-only">
              {lives} of {config.lives}
            </span>
          </strong>
        </div>
        <div className="arcade-hud__stat">
          <span>{config.label}</span>
          <strong>
            {index + 1}/{total}
          </strong>
        </div>
      </div>

      {config.secondsPerRound > 0 ? (
        <ArcadeTimer
          key={`${index}-${game.difficulty}-${ui.checked ? "done" : "go"}`}
          seconds={config.secondsPerRound}
          paused={ui.checked}
          onTick={setSecondsLeft}
          onTimeout={() => resolveRound(false, true)}
        />
      ) : null}

      <div className="arcade-stage">
        {floatScores.map((item) => (
          <span key={item.id} className="arcade-float">
            {item.text}
          </span>
        ))}

        <div className="arcade-stage__word">
          <p>
            <span className="arcade-stage__label">Focus</span>{" "}
            <strong>{currentRound.headword}</strong>
            <span className="arcade-stage__gloss"> · {currentRound.english}</span>
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
            <p className="arcade-prompt">{currentRound.promptSentence}</p>
            {config.showEnglishHint ? (
              <p className="arcade-hint">{currentRound.englishHint}</p>
            ) : (
              <p className="arcade-hint arcade-hint--hidden">English hint hidden on Hard</p>
            )}
            <div className="arcade-options" role="group" aria-label="Word choices">
              {currentRound.options.map((option) => {
                let className = "arcade-option";
                if (ui.checked && option === currentRound.correctOption) {
                  className += " is-correct";
                }
                if (
                  ui.checked &&
                  ui.selected === option &&
                  option !== currentRound.correctOption
                ) {
                  className += " is-wrong";
                }
                return (
                  <button
                    key={option}
                    type="button"
                    className={className}
                    disabled={ui.checked}
                    onClick={() => onClozePick(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {config.showEnglishHint ? (
              <p className="arcade-hint">{currentRound.englishHint}</p>
            ) : (
              <p className="arcade-hint arcade-hint--hidden">English hint hidden on Hard</p>
            )}
            <div className="arcade-built" aria-label="Your sentence">
              {ui.tilePicks.length
                ? joinTokens(ui.tilePicks)
                : "Tap tiles in order…"}
            </div>
            <div className="arcade-tiles" role="group" aria-label="Word tiles">
              {ui.remainingTiles.map((token, tokenIndex) => (
                <button
                  key={`${token}-${tokenIndex}-${ui.remainingTiles.length}`}
                  type="button"
                  className="arcade-tile"
                  disabled={ui.checked}
                  onClick={() => {
                    const nextPicks = [...ui.tilePicks, token];
                    const nextRemaining = ui.remainingTiles.filter(
                      (_, i) => i !== tokenIndex,
                    );
                    setUi((current) => ({
                      ...current,
                      tilePicks: nextPicks,
                      remainingTiles: nextRemaining,
                    }));
                    tryAutoCheckTiles(nextPicks, currentRound.correctTokens);
                  }}
                >
                  {token}
                </button>
              ))}
            </div>
            {!ui.checked ? (
              <div className="arcade-tile-tools">
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
          <p className={`arcade-feedback ${pulse === "ok" ? "is-correct" : "is-wrong"}`}>
            {ui.timedOut
              ? `Time’s up — “${currentRound.type === "sentence-cloze" ? currentRound.correctOption : joinTokens(currentRound.correctTokens)}”`
              : pulse === "ok"
                ? streak > 1
                  ? `Nice! ${streak} streak`
                  : "Correct!"
                : currentRound.type === "sentence-cloze"
                  ? `It’s “${currentRound.correctOption}”`
                  : joinTokens(currentRound.correctTokens)}
          </p>
        ) : null}
      </div>

      <div className="arcade-footer-links">
        <Link href={`/dictionary/${currentRound.entrySlug}`} className="text-link">
          Open word
        </Link>
        <button type="button" className="text-link" onClick={() => setPhase("lobby")}>
          Quit to lobby
        </button>
      </div>
    </div>
  );
}
