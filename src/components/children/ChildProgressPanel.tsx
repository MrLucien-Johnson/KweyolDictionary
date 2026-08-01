"use client";

import { useEffect, useState } from "react";
import {
  BADGE_LABELS,
  EMPTY_PROGRESS,
  loadChildProgress,
  type ChildProgress,
} from "@/lib/progress/child-progress";

export function ChildProgressPanel() {
  const [progress, setProgress] = useState<ChildProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProgress(loadChildProgress());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="child-progress" aria-label="Your stars and badges">
      <h2 className="section-title">Your stars</h2>
      <p className="section-lead">
        Progress stays on this device. We do not ask children for personal
        information.
      </p>
      <p className="child-progress__stars">{progress.stars} stars</p>
      <ul className="child-progress__badges">
        {progress.badges.length ? (
          progress.badges.map((badge) => (
            <li key={badge}>{BADGE_LABELS[badge]}</li>
          ))
        ) : (
          <li>Play a game or listen to a word to earn your first badge.</li>
        )}
      </ul>
    </section>
  );
}
