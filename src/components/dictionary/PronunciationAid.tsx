"use client";

import Link from "next/link";
import { AudioButton } from "@/components/dictionary/AudioButton";

type PronunciationAidProps = {
  kweyolWord: string;
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
  kweyolWord,
  audioSrc,
  audioSource = null,
  featured = false,
  large = false,
}: PronunciationAidProps) {
  const practiceWithBrowser = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(kweyolWord);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const isSynthetic = audioSource === "SYNTHETIC_TTS";

  return (
    <div className={`pronunciation-aid ${large ? "pronunciation-aid--large" : ""}`}>
      <AudioButton
        src={audioSrc}
        label={isSynthetic ? "Practice audio" : "Pronunciation"}
        large={large}
      />
      {!audioSrc ? (
        <p className="pronunciation-aid__status">
          Native Dominican audio not recorded yet.
          {featured ? " Featured word — priority for community recording." : null}{" "}
          <Link href="/contribute">Suggest / contribute audio</Link>
        </p>
      ) : isSynthetic ? (
        <p className="pronunciation-aid__status">
          Synthetic practice audio (French neural TTS approximation).{" "}
          <strong>Not native Dominican Kwéyòl.</strong> Community recordings welcome —{" "}
          <Link href="/contribute">contribute audio</Link>.
        </p>
      ) : (
        <p className="pronunciation-aid__status">
          Recorded audio is provisional until marked verified native pronunciation.
        </p>
      )}
      <button
        type="button"
        className="btn btn--soft btn--md pronunciation-aid__practice"
        onClick={practiceWithBrowser}
      >
        Practice with browser speech
      </button>
      <p className="pronunciation-aid__caveat">
        Browser speech and synthetic TTS are rough practice aids only — not verified
        Dominican Kwéyòl native audio.
      </p>
    </div>
  );
}
