import { listEntries } from "@/lib/content/catalog";
import { needsNativeAudio } from "@/lib/audio/pick";
import type { PublishedEntry } from "@/lib/content/types";

export type NativeAudioAsk = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  featured: boolean;
  contributeHref: string;
};

function toAsk(entry: PublishedEntry): NativeAudioAsk {
  return {
    slug: entry.slug,
    kweyolWord: entry.kweyolWord,
    englishTranslation: entry.englishTranslation,
    featured: entry.isFeatured,
    contributeHref: `/contribute?type=AUDIO&entry=${encodeURIComponent(entry.slug)}&word=${encodeURIComponent(entry.kweyolWord)}&english=${encodeURIComponent(entry.englishTranslation)}`,
  };
}

/** Featured words still on synthetic TTS — highest recording priority. */
export function listFeaturedNeedingNativeAudio(limit = 31): NativeAudioAsk[] {
  return listEntries({ featured: true })
    .filter((entry) => needsNativeAudio(entry))
    .sort((a, b) => a.kweyolWord.localeCompare(b.kweyolWord))
    .slice(0, limit)
    .map(toAsk);
}

export function countNativeAudioProgress() {
  const entries = listEntries({});
  let recorded = 0;
  let synthetic = 0;
  let missing = 0;
  for (const entry of entries) {
    if (!needsNativeAudio(entry)) {
      recorded += 1;
      continue;
    }
    if ((entry.audioFiles ?? []).some((file) => file.status !== "MISSING")) {
      synthetic += 1;
    } else {
      missing += 1;
    }
  }
  return {
    total: entries.length,
    recorded,
    synthetic,
    missing,
    featuredNeedingNative: listFeaturedNeedingNativeAudio(1000).length,
  };
}
