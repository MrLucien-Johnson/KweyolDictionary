"use client";

import Link from "next/link";
import { AudioButton } from "@/components/dictionary/AudioButton";
import { audioListenLabel } from "@/lib/audio/pick";

type PronunciationAidProps = {
  slug?: string;
  kweyolWord: string;
  englishTranslation?: string;
  audioSrc?: string | null;
  audioSource?: "SYNTHETIC_TTS" | "RECORDED" | "UNKNOWN" | null;
  featured?: boolean;
  large?: boolean;
};

/**
 * Prefers audio files when present. Synthetic TTS and browser speech are practice
 * aids only and must never be presented as verified Dominican native audio.
 */
export function PronunciationAid({
  slug,
  kweyolWord,
  englishTranslation = "",
  audioSrc,
  audioSource = null,
  featured = false,
  large = false,
}: PronunciationAidProps) {
  const contributeHref = `/contribute?type=AUDIO&entry=${encodeURIComponent(slug || kweyolWord)}&word=${encodeURIComponent(kweyolWord)}&english=${encodeURIComponent(englishTranslation)}`;
  const practiceWithBrowser = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(kweyolWord);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const isSynthetic = audioSource === "SYNTHETIC_TTS";
  const isRecorded = audioSource === "RECORDED";

  return (
    <div className={`pronunciation-aid ${large ? "pronunciation-aid--large" : ""}`}>
      <div className="pronunciation-aid__controls">
        <AudioButton
          src={audioSrc}
          label={audioListenLabel(kweyolWord, audioSource)}
          large={large}
        />
        <button
          type="button"
          className="btn btn--soft btn--md pronunciation-aid__practice"
          onClick={practiceWithBrowser}
        >
          Browser speech
        </button>
        {isSynthetic || !audioSrc ? (
          <Link href={contributeHref} className="btn btn--primary btn--md">
            Record native audio
          </Link>
        ) : null}
      </div>
      {!audioSrc ? (
        <p className="pronunciation-aid__status">
          Native Dominican audio not recorded yet.
          {featured ? " Featured word — priority for community recording." : null}{" "}
          <Link href={contributeHref}>Contribute a recording</Link>
        </p>
      ) : isSynthetic ? (
        <p className="pronunciation-aid__status">
          Synthetic practice audio only —{" "}
          <strong>not native Dominican Kwéyòl.</strong> A French neural voice is
          used until a reviewed community recording replaces it.{" "}
          <Link href={contributeHref}>Record this word</Link>
        </p>
      ) : isRecorded ? (
        <p className="pronunciation-aid__status">
          Community recording (provisional). Not yet marked as verified native
          Dominican pronunciation.
        </p>
      ) : (
        <p className="pronunciation-aid__status">
          Audio is provisional until verified as native pronunciation.
        </p>
      )}
      <p className="pronunciation-aid__caveat">
        Browser speech and synthetic TTS are practice aids, not verified native audio.
      </p>
    </div>
  );
}
