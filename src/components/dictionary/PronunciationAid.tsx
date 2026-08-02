"use client";

import Link from "next/link";
import { AudioButton } from "@/components/dictionary/AudioButton";

type PronunciationAidProps = {
  kweyolWord: string;
  audioSrc?: string | null;
  featured?: boolean;
  large?: boolean;
};

/**
 * Prefers recorded files when present. Browser speech is only a practice aid and
 * must never be presented as verified Dominican native audio.
 */
export function PronunciationAid({
  kweyolWord,
  audioSrc,
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

  return (
    <div className={`pronunciation-aid ${large ? "pronunciation-aid--large" : ""}`}>
      <AudioButton src={audioSrc} label="Pronunciation" large={large} />
      {!audioSrc ? (
        <p className="pronunciation-aid__status">
          Native Dominican audio not recorded yet.
          {featured ? " Featured word — priority for community recording." : null}{" "}
          <Link href="/contribute">Suggest / contribute audio</Link>
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
        Browser speech is not Dominican Kwéyòl native audio — use it only as a rough
        practice aid.
      </p>
    </div>
  );
}
