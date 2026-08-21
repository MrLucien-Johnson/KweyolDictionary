"use client";

import { useEffect, useRef, useState } from "react";

type ArcadeTimerProps = {
  seconds: number;
  paused?: boolean;
  onTick?: (secondsLeft: number) => void;
  onTimeout: () => void;
};

/**
 * Counts down from `seconds`. Pausing freezes remaining time.
 * Parent should remount (new `key`) when a new round starts.
 */
export function ArcadeTimer({
  seconds,
  paused = false,
  onTick,
  onTimeout,
}: ArcadeTimerProps) {
  const [left, setLeft] = useState(seconds);
  const leftRef = useRef(seconds);
  const pausedRef = useRef(paused);
  const ratio = seconds > 0 ? left / seconds : 0;

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (paused || seconds <= 0) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      const next = leftRef.current - 1;
      leftRef.current = next;
      setLeft(next);
      onTick?.(next);
      if (next <= 0) {
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
