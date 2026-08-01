"use client";

type AudioButtonProps = {
  src?: string | null;
  label?: string;
  large?: boolean;
  onPlay?: () => void;
};

export function AudioButton({
  src,
  label = "Listen",
  large = false,
  onPlay,
}: AudioButtonProps) {
  if (!src) {
    return (
      <button
        type="button"
        className={`audio-btn audio-btn--unavailable ${large ? "audio-btn--large" : ""}`}
        disabled
        aria-disabled="true"
        title="Audio not available yet"
      >
        {label} unavailable
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`audio-btn ${large ? "audio-btn--large" : ""}`}
      onClick={() => {
        const audio = new Audio(src);
        void audio.play().catch(() => {
          /* browser may block autoplay; user gesture already given */
        });
        onPlay?.();
      }}
    >
      {label}
    </button>
  );
}
