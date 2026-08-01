"use client";

import { useMemo, useState } from "react";
import {
  awardStars,
  loadChildProgress,
  markActivityComplete,
  saveChildProgress,
} from "@/lib/progress/child-progress";

type ChildActivityPlayerProps = {
  slug: string;
  title: string;
  activityType: string;
  configJson: string | null;
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

  const prompts =
    (config.prompts as { slug: string; label: string; meaning: string }[]) ?? [];
  const pairs = (config.pairs as { kweyol: string; english: string }[]) ?? [];
  const cards = (config.cards as { id: string; face: string; match: string }[]) ?? [];
  const spellingTarget = String(config.target ?? "");
  const tiles = (config.tiles as string[]) ?? [];

  const [message, setMessage] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [selectedKweyol, setSelectedKweyol] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [built, setBuilt] = useState("");

  function complete(extraStars = 0) {
    let progress = markActivityComplete(loadChildProgress(), slug);
    if (extraStars) progress = awardStars(progress, extraStars);
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
    setMessage("Great job! You earned stars. Progress is saved on this device.");
  }

  return (
    <div className="activity-player">
      <h1>{title}</h1>

      {(activityType === "tap-picture" || activityType === "picture-quiz") && (
        <>
          <p className="section-lead">
            Tap the picture that matches <strong>{prompts[0]?.label}</strong>.
          </p>
          <div className="child-word-grid">
            {prompts.map((prompt) => (
              <button
                key={prompt.slug}
                type="button"
                className={`child-word-card ${choice === prompt.slug ? "is-selected" : ""}`}
                onClick={() => {
                  setChoice(prompt.slug);
                  if (prompt.slug === prompts[0]?.slug) complete();
                  else setMessage("Try again — you can do it!");
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/placeholders/colours.svg"
                  alt={prompt.meaning}
                  width={180}
                  height={180}
                />
                <span>{prompt.meaning}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {activityType === "match-pairs" && (
        <>
          <p className="section-lead">Match each Kwéyòl word to English.</p>
          <div className="match-board">
            <div className="match-board__col">
              {pairs.map((pair) => (
                <button
                  key={pair.kweyol}
                  type="button"
                  className="btn btn--soft btn--lg"
                  disabled={matched.includes(pair.kweyol)}
                  onClick={() => setSelectedKweyol(pair.kweyol)}
                >
                  {pair.kweyol}
                </button>
              ))}
            </div>
            <div className="match-board__col">
              {pairs.map((pair) => (
                <button
                  key={pair.english}
                  type="button"
                  className="btn btn--soft btn--lg"
                  disabled={matched.includes(pair.kweyol)}
                  onClick={() => {
                    if (selectedKweyol === pair.kweyol) {
                      const next = [...matched, pair.kweyol];
                      setMatched(next);
                      setSelectedKweyol(null);
                      if (next.length === pairs.length) complete();
                    } else {
                      setMessage("Not a match — try another pair.");
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
          <p className="section-lead">Build the word with letter tiles.</p>
          <p className="spelling-built" aria-live="polite">
            {built || "…"}
          </p>
          <div className="tile-row">
            {tiles.map((tile, index) => (
              <button
                key={`${tile}-${index}`}
                type="button"
                className="btn btn--secondary btn--md"
                onClick={() => setBuilt((value) => value + tile)}
              >
                {tile}
              </button>
            ))}
          </div>
          <div className="flashcards__controls">
            <button
              type="button"
              className="btn btn--soft btn--md"
              onClick={() => setBuilt("")}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn--primary btn--md"
              onClick={() => {
                if (built === spellingTarget) complete(1);
                else setMessage("Almost! Clear and try again.");
              }}
            >
              Check
            </button>
          </div>
        </>
      )}

      {(activityType === "memory" ||
        !["tap-picture", "picture-quiz", "match-pairs", "spelling-tiles"].includes(
          activityType,
        )) && (
        <>
          <p className="section-lead">
            Memory / picture practice. Review the pairs, then mark complete.
          </p>
          <ul className="plain-list">
            {cards.map((card) => (
              <li key={card.id}>
                <strong>{card.face}</strong> ↔ {card.match}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => complete()}
          >
            I finished this activity
          </button>
        </>
      )}

      {message ? (
        <p role="status" className="quiz-feedback quiz-feedback--ok">
          {message}
        </p>
      ) : null}
    </div>
  );
}
