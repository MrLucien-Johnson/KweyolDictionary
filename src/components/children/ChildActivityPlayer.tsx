"use client";

import { useMemo, useState } from "react";
import { PublicImage } from "@/components/ui/PublicImage";
import {
  awardStars,
  loadChildProgress,
  markActivityComplete,
  saveChildProgress,
} from "@/lib/progress/child-progress";
import {
  shuffleInPlace,
  shuffleUntilDifferentOrder,
} from "@/lib/practice/sentence";

type ChildActivityPlayerProps = {
  slug: string;
  title: string;
  activityType: string;
  configJson: string | null;
};

type PicturePrompt = {
  slug: string;
  label: string;
  meaning: string;
  swatch?: string;
  image?: string;
};
type MatchPair = { kweyol: string; english: string };
type MemoryCardSeed = { id: string; face: string; match: string };
type MemoryCard = {
  key: string;
  pairId: string;
  text: string;
};
type SpellingTile = { id: string; letter: string };

const MEANING_SWATCHES: Record<string, string> = {
  red: "#c0392b",
  blue: "#2471a3",
  yellow: "#f4d03f",
  green: "#1e8449",
  white: "#f7f9f8",
  black: "#1c2833",
  orange: "#e67e22",
};

export function ChildActivityPlayer({
  slug,
  title,
  activityType,
  configJson,
}: ChildActivityPlayerProps) {
  const config = useMemo(() => {
    try {
      return configJson ? (JSON.parse(configJson) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }, [configJson]);

  const prompts = (config.prompts as PicturePrompt[]) ?? [];
  const pairs = (config.pairs as MatchPair[]) ?? [];
  const cards = (config.cards as MemoryCardSeed[]) ?? [];
  const spellingTarget = String(config.target ?? "");
  const spellingMeaning = String(config.meaning ?? "").trim();

  const layout = useMemo(() => {
    const nextPrompts = (config.prompts as PicturePrompt[]) ?? [];
    const nextPairs = (config.pairs as MatchPair[]) ?? [];
    const nextTiles = (config.tiles as string[]) ?? [];
    const memorySeed = (config.cards as MemoryCardSeed[]) ?? [];
    const memoryDeck: MemoryCard[] = shuffleInPlace(
      memorySeed.flatMap((card) => [
        { key: `${card.id}-a`, pairId: card.id, text: card.face },
        { key: `${card.id}-b`, pairId: card.id, text: card.match },
      ]),
    );
    const kweyolColumn = shuffleInPlace([...nextPairs]);
    const englishColumn = shuffleUntilDifferentOrder(
      nextPairs,
      kweyolColumn.map((pair) => pair.kweyol),
      (pair) => pair.kweyol,
    );
    return {
      pictureOptions: shuffleInPlace([...nextPrompts]),
      kweyolColumn,
      englishColumn,
      spellingTiles: shuffleInPlace(
        nextTiles.map((letter, index) => ({
          id: `${index}-${letter}`,
          letter,
        })),
      ) as SpellingTile[],
      memoryDeck,
    };
  }, [config]);

  const pictureOptions = layout.pictureOptions;
  const pictureTargetSlug = prompts[0]?.slug ?? null;
  const kweyolColumn = layout.kweyolColumn;
  const englishColumn = layout.englishColumn;
  const spellingTiles = layout.spellingTiles;
  const memoryDeck = layout.memoryDeck;

  const [message, setMessage] = useState<string | null>(null);
  const [messageOk, setMessageOk] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [selectedKweyol, setSelectedKweyol] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [built, setBuilt] = useState("");
  const [remainingSpellingTiles, setRemainingSpellingTiles] = useState<
    SpellingTile[]
  >(() => spellingTiles);
  const [spellingDone, setSpellingDone] = useState(false);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<string[]>([]);
  const [memoryLock, setMemoryLock] = useState(false);

  function showStatus(text: string, ok: boolean) {
    setMessage(text);
    setMessageOk(ok);
  }

  function complete(extraStars = 0) {
    let progress = loadChildProgress();
    const alreadyDone = progress.completedActivities.includes(slug);
    progress = markActivityComplete(progress, slug);
    if (extraStars && !alreadyDone) {
      progress = awardStars(progress, extraStars);
    }
    if (
      activityType === "spelling-tiles" &&
      !progress.badges.includes("spelling-try")
    ) {
      progress = {
        ...progress,
        badges: [...progress.badges, "spelling-try"],
      };
    }
    saveChildProgress(progress);
    showStatus(
      "Great job! You earned stars. Progress is saved on this device.",
      true,
    );
  }

  function swatchFor(prompt: PicturePrompt) {
    return (
      prompt.swatch ||
      MEANING_SWATCHES[prompt.meaning.toLowerCase()] ||
      null
    );
  }

  return (
    <div className="activity-player">
      <h1>{title}</h1>

      {(activityType === "tap-picture" || activityType === "picture-quiz") && (
        <>
          <p className="section-lead">
            Tap the picture that matches{" "}
            <strong>{prompts[0]?.label}</strong>.
          </p>
          <div className="child-word-grid">
            {pictureOptions.map((prompt) => {
              const swatch = swatchFor(prompt);
              return (
                <button
                  key={prompt.slug}
                  type="button"
                  className={`child-word-card ${choice === prompt.slug ? "is-selected" : ""}`}
                  onClick={() => {
                    setChoice(prompt.slug);
                    if (pictureTargetSlug && prompt.slug === pictureTargetSlug) {
                      complete();
                    } else {
                      showStatus("Try again — you can do it!", false);
                    }
                  }}
                >
                  {swatch ? (
                    <span
                      className="child-word-card__swatch"
                      style={{ background: swatch }}
                      aria-hidden="true"
                    />
                  ) : (
                    <PublicImage
                      src={
                        prompt.image ?? "/images/placeholders/colours.svg"
                      }
                      alt={prompt.meaning}
                      width={180}
                      height={180}
                    />
                  )}
                  <span>{prompt.meaning}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {activityType === "match-pairs" && (
        <>
          <p className="section-lead">Match each Kwéyòl word to English.</p>
          <div className="match-board">
            <div className="match-board__col">
              {kweyolColumn.map((pair) => (
                <button
                  key={pair.kweyol}
                  type="button"
                  className={
                    selectedKweyol === pair.kweyol
                      ? "btn btn--soft btn--lg is-selected"
                      : "btn btn--soft btn--lg"
                  }
                  aria-pressed={selectedKweyol === pair.kweyol}
                  disabled={matched.includes(pair.kweyol)}
                  onClick={() => {
                    setMessage(null);
                    setSelectedKweyol(pair.kweyol);
                  }}
                >
                  {pair.kweyol}
                </button>
              ))}
            </div>
            <div className="match-board__col">
              {englishColumn.map((pair) => (
                <button
                  key={pair.english}
                  type="button"
                  className="btn btn--soft btn--lg"
                  disabled={matched.includes(pair.kweyol)}
                  onClick={() => {
                    if (!selectedKweyol) return;
                    if (selectedKweyol === pair.kweyol) {
                      const next = [...matched, pair.kweyol];
                      setMatched(next);
                      setSelectedKweyol(null);
                      setMessage(null);
                      if (next.length === pairs.length) complete();
                    } else {
                      showStatus("Not a match — try another pair.", false);
                    }
                  }}
                >
                  {pair.english}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activityType === "spelling-tiles" && (
        <>
          <p className="section-lead">
            {spellingMeaning
              ? <>Spell the Kwéyòl word for <strong>{spellingMeaning}</strong>.</>
              : "Build the word with letter tiles."}
          </p>
          <p className="spelling-built" aria-live="polite">
            {built || "…"}
          </p>
          <div className="tile-row">
            {remainingSpellingTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                className="btn btn--secondary btn--md"
                disabled={spellingDone}
                onClick={() => {
                  setBuilt((value) => value + tile.letter);
                  setRemainingSpellingTiles((current) =>
                    current.filter((item) => item.id !== tile.id),
                  );
                }}
              >
                {tile.letter}
              </button>
            ))}
          </div>
          <div className="flashcards__controls">
            <button
              type="button"
              className="btn btn--soft btn--md"
              disabled={spellingDone}
              onClick={() => {
                setBuilt("");
                setRemainingSpellingTiles([...spellingTiles]);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn--primary btn--md"
              disabled={spellingDone}
              onClick={() => {
                if (built === spellingTarget) {
                  setSpellingDone(true);
                  complete(1);
                } else {
                  showStatus("Almost! Clear and try again.", false);
                }
              }}
            >
              Check
            </button>
          </div>
        </>
      )}

      {activityType === "memory" && (
        <>
          <p className="section-lead">
            Flip two cards. Match each Kwéyòl word with its English meaning.
          </p>
          <div className="memory-grid" role="group" aria-label="Memory cards">
            {memoryDeck.map((card) => {
              const isMatched = memoryMatched.includes(card.pairId);
              const isFlipped = isMatched || flipped.includes(card.key);
              return (
                <button
                  key={card.key}
                  type="button"
                  className={
                    isFlipped
                      ? "memory-card is-flipped"
                      : "memory-card"
                  }
                  disabled={isMatched || memoryLock || isFlipped}
                  onClick={() => {
                    if (memoryLock || isMatched || flipped.includes(card.key)) {
                      return;
                    }
                    setMessage(null);
                    const nextFlipped = [...flipped, card.key];
                    setFlipped(nextFlipped);
                    if (nextFlipped.length < 2) return;

                    const [firstKey, secondKey] = nextFlipped;
                    const first = memoryDeck.find((item) => item.key === firstKey);
                    const second = memoryDeck.find((item) => item.key === secondKey);
                    if (!first || !second) return;

                    if (first.pairId === second.pairId) {
                      const nextMatched = [...memoryMatched, first.pairId];
                      setMemoryMatched(nextMatched);
                      setFlipped([]);
                      if (nextMatched.length === cards.length) complete(1);
                      return;
                    }

                    setMemoryLock(true);
                    window.setTimeout(() => {
                      setFlipped([]);
                      setMemoryLock(false);
                      showStatus("Not a match — try again.", false);
                    }, 700);
                  }}
                >
                  <span className="memory-card__face">
                    {isFlipped ? card.text : "?"}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {activityType !== "tap-picture" &&
      activityType !== "picture-quiz" &&
      activityType !== "match-pairs" &&
      activityType !== "spelling-tiles" &&
      activityType !== "memory" ? (
        <>
          <p className="section-lead">
            This activity type is not playable yet. Mark complete when you have
            reviewed it with a teacher.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => complete()}
          >
            I finished this activity
          </button>
        </>
      ) : null}

      {message ? (
        <p
          role="status"
          className={
            messageOk
              ? "quiz-feedback quiz-feedback--ok"
              : "quiz-feedback quiz-feedback--bad"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
