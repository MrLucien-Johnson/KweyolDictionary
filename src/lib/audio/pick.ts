import type { PublishedEntry } from "@/lib/content/types";

export type AudioSource = "SYNTHETIC_TTS" | "RECORDED" | "UNKNOWN";

export type PlayableAudio = {
  filePath: string;
  source: AudioSource;
  status: string;
  voice?: string | null;
  id: string;
};

function sourceRank(source: AudioSource | undefined) {
  switch (source) {
    case "RECORDED":
      return 0;
    case "UNKNOWN":
      return 1;
    case "SYNTHETIC_TTS":
      return 2;
    default:
      return 3;
  }
}

/** Prefer community/recorded files over synthetic practice TTS. */
export function pickPlayableAudio(
  entry: Pick<PublishedEntry, "audioFiles"> | null | undefined,
): PlayableAudio | null {
  const playable = (entry?.audioFiles ?? []).filter(
    (file) => file.status !== "MISSING" && Boolean(file.filePath),
  );
  if (!playable.length) return null;

  const sorted = [...playable].sort(
    (a, b) => sourceRank(a.source) - sourceRank(b.source),
  );
  const best = sorted[0]!;
  return {
    id: best.id,
    filePath: best.filePath,
    status: best.status,
    source: best.source ?? "UNKNOWN",
    voice: best.voice,
  };
}

export function needsNativeAudio(
  entry: Pick<PublishedEntry, "audioFiles"> | null | undefined,
) {
  const audio = pickPlayableAudio(entry);
  return !audio || audio.source === "SYNTHETIC_TTS";
}

export function audioListenLabel(
  kweyolWord: string,
  source?: AudioSource | null,
) {
  if (source === "SYNTHETIC_TTS") {
    return `Play practice audio for ${kweyolWord}`;
  }
  if (source === "RECORDED") {
    return `Play community recording of ${kweyolWord}`;
  }
  return `Play pronunciation of ${kweyolWord}`;
}
