import Link from "next/link";

type WordCardProps = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  partOfSpeech?: string | null;
  pronunciationGuide?: string | null;
};

export function WordCard({
  slug,
  kweyolWord,
  englishTranslation,
  partOfSpeech,
  pronunciationGuide,
}: WordCardProps) {
  return (
    <article className="word-card">
      <h3 className="word-card__title">
        <Link href={`/dictionary/${slug}`}>{kweyolWord}</Link>
      </h3>
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
