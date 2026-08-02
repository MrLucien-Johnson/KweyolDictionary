"use client";

type AudioButtonProps = {
  src?: string | null;
  label?: string;
  large?: boolean;
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

  const resolvedSrc = resolvePublicAssetPath(src);

  return (
    <button
      type="button"
      className={`audio-btn ${large ? "audio-btn--large" : ""}`}
      onClick={() => {
        const audio = new Audio(resolvedSrc);
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
