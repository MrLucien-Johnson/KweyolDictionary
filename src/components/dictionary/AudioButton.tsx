"use client";

type AudioButtonProps = {
  src?: string | null;
  label?: string;
  large?: boolean;
  /** Compact speaker icon for placement beside a headword. */
  variant?: "button" | "icon";
  onPlay?: () => void;
};

function resolvePublicAssetPath(src: string) {
  if (src.startsWith("http") || src.startsWith("blob:") || src.startsWith("data:")) {
    return src;
  }
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base || !src.startsWith("/") || src.startsWith(`${base}/`)) {
    return src;
  }
  return `${base}${src}`;
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M3 10v4a1 1 0 0 0 1 1h2.6l3.7 3.1a1 1 0 0 0 1.6-.8V6.7a1 1 0 0 0-1.6-.8L6.6 9H4a1 1 0 0 0-1 1Zm12.5 1a2.5 2.5 0 0 1 0 2 1 1 0 1 0 1.7 1 4.5 4.5 0 0 0 0-4 1 1 0 1 0-1.7 1Zm2.1-3.8a1 1 0 0 0-1.4 1.4 6 6 0 0 1 0 8.8 1 1 0 1 0 1.4 1.4 8 8 0 0 0 0-11.6Z"
      />
    </svg>
  );
}

export function AudioButton({
  src,
  label = "Listen",
  large = false,
  variant = "button",
  onPlay,
}: AudioButtonProps) {
  const isIcon = variant === "icon";

  if (!src) {
    return (
      <button
        type="button"
        className={`audio-btn ${isIcon ? "audio-btn--icon" : ""} audio-btn--unavailable ${large ? "audio-btn--large" : ""}`}
        disabled
        aria-disabled="true"
        title="Audio not available yet"
        aria-label={`${label} unavailable`}
      >
        {isIcon ? <SpeakerIcon /> : `${label} unavailable`}
      </button>
    );
  }

  const resolvedSrc = resolvePublicAssetPath(src);

  return (
    <button
      type="button"
      className={`audio-btn ${isIcon ? "audio-btn--icon" : ""} ${large ? "audio-btn--large" : ""}`}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const audio = new Audio(resolvedSrc);
        void audio.play().catch(() => {
          /* browser may block autoplay; user gesture already given */
        });
        onPlay?.();
      }}
    >
      {isIcon ? <SpeakerIcon /> : label}
    </button>
  );
}
