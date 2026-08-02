"use client";

import { useState } from "react";

type Card = {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
};

export function Flashcards({ cards }: { cards: Card[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length) {
    return (
      <div className="empty-state">
        <h2>No approved cards yet</h2>
        <p>Flashcards appear when approved dictionary entries are available.</p>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="flashcards">
      <button
        type="button"
        className={`flashcard ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "Hide translation" : "Reveal translation"}
      >
        <span className="flashcard__face">
          {flipped ? card.back : card.front}
        </span>
        {!flipped && card.hint ? (
          <span className="flashcard__hint">/{card.hint}/</span>
        ) : null}
      </button>
      <div className="flashcards__controls">
        <button
          type="button"
          className="btn btn--soft btn--md"
          onClick={() => {
            setFlipped(false);
            setIndex((current) => (current - 1 + cards.length) % cards.length);
          }}
        >
          Previous
        </button>
        <p>
          {index + 1} / {cards.length}
        </p>
        <button
          type="button"
          className="btn btn--soft btn--md"
          onClick={() => {
            setFlipped(false);
            setIndex((current) => (current + 1) % cards.length);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
