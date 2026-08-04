"use client";

import { useEffect, useState } from "react";

type ArcadeTimerProps = {
  seconds: number;
  paused?: boolean;
  onTick?: (secondsLeft: number) => void;
  onTimeout: () => void;
};

export function ArcadeTimer({
  seconds,
  paused = false,
  onTick,
  onTimeout,
}: ArcadeTimerProps) {
  const [left, setLeft] = useState(seconds);
  const ratio = seconds > 0 ? left / seconds : 0;

  useEffect(() => {
    if (paused || seconds <= 0) return;
    let remaining = seconds;
    const timer = window.setInterval(() => {
      remaining -= 1;
      setLeft(remaining);
      onTick?.(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
        onTimeout();
      }
    }, 1000);
    return () => window.clearInterval(timer);
    // Callbacks intentionally excluded so the timer is not reset every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, paused]);

  return (
    <div
      className={`arcade-timer ${left <= 5 ? "is-urgent" : ""}`}
      aria-label={`${left} seconds left`}
    >
      <span style={{ transform: `scaleX(${ratio})` }} />
      <em>{left}s</em>
    </div>
  );
}
