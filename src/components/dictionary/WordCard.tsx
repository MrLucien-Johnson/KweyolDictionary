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
      <div className="word-heading">
        <h3 className="word-card__title">
          <Link href={`/dictionary/${slug}`}>{kweyolWord}</Link>
        </h3>
        <AudioButton
          variant="icon"
          src={audioSrc}
          label={`Play pronunciation of ${kweyolWord}`}
        />
      </div>
      <p className="word-card__english">{englishTranslation}</p>
      <div className="word-card__meta">
        {partOfSpeech ? <span className="meta-pill">{partOfSpeech}</span> : null}
        {pronunciationGuide ? (
          <span className="word-card__pron">/{pronunciationGuide}/</span>
        ) : null}
      </div>
    </article>
  );
}
