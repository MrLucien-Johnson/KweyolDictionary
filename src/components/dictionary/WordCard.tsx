import Link from "next/link";
import { AudioButton } from "@/components/dictionary/AudioButton";

type WordCardProps = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  partOfSpeech?: string | null;
  pronunciationGuide?: string | null;
  audioSrc?: string | null;
};

export function WordCard({
  slug,
  kweyolWord,
  englishTranslation,
  partOfSpeech,
  pronunciationGuide,
  audioSrc,
}: WordCardProps) {
  return (
    <article className="word-card">
      <div className="word-card__top">
        <div className="word-heading">
          <h3 className="word-card__title">
            <Link href={`/dictionary/${slug}`} className="word-card__title-link">
              {kweyolWord}
            </Link>
          </h3>
          <AudioButton
            variant="icon"
            src={audioSrc}
            label={`Play pronunciation of ${kweyolWord}`}
          />
        </div>
        <p className="word-card__english">
          <Link href={`/dictionary/${slug}`} className="word-card__english-link">
            {englishTranslation}
          </Link>
        </p>
      </div>
      <div className="word-card__meta">
        {partOfSpeech ? <span className="meta-pill">{partOfSpeech}</span> : null}
        {pronunciationGuide ? (
          <span className="word-card__pron">/{pronunciationGuide}/</span>
        ) : null}
        <Link href={`/dictionary/${slug}`} className="word-card__open">
          Open entry
          <span className="sr-only"> for {kweyolWord}</span>
        </Link>
      </div>
    </article>
  );
}
