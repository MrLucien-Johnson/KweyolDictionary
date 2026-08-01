import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioButton } from "@/components/dictionary/AudioButton";
import { WordActions } from "@/components/dictionary/WordActions";
import {
  getAdjacentEntries,
  getEntryBySlug,
} from "@/lib/dictionary/queries";

type WordPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: WordPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) {
    return { title: "Word not found" };
  }
  return {
    title: `${entry.kweyolWord} — ${entry.englishTranslation}`,
    description:
      entry.simpleDefinition ??
      `${entry.kweyolWord}: ${entry.englishTranslation} in Dominican Kwéyòl.`,
    alternates: { canonical: `/dictionary/${entry.slug}` },
    openGraph: {
      title: `${entry.kweyolWord} · Dominican Kwéyòl`,
      description: entry.englishTranslation,
    },
  };
}

export default async function WordDetailPage({ params }: WordPageProps) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  const { previous, next } = await getAdjacentEntries(entry.slug);
  const audio = entry.audioFiles.find((file) => file.status !== "MISSING");
  const related = [
    ...entry.synonyms.map((relation) => relation.toEntry),
    ...entry.relatedFrom.map((relation) => relation.fromEntry),
  ].filter(
    (item, index, arr) =>
      item.reviewStatus === "APPROVED" &&
      arr.findIndex((candidate) => candidate.id === item.id) === index,
  );

  const definition =
    entry.adultPresentation?.displayDefinition ||
    entry.detailedDefinition ||
    entry.simpleDefinition;

  return (
    <article className="word-detail">
      <header className="word-detail__header">
        <p className="word-detail__eyebrow">Dominican Kwéyòl</p>
        <h1 className="word-detail__word">{entry.kweyolWord}</h1>
        <p className="word-detail__english">{entry.englishTranslation}</p>
        <div className="word-detail__meta">
          {entry.partOfSpeech ? (
            <span className="meta-pill">{entry.partOfSpeech}</span>
          ) : null}
          {entry.pronunciationGuide ? (
            <span className="word-detail__pron">/{entry.pronunciationGuide}/</span>
          ) : null}
          <AudioButton src={audio?.filePath} label="Pronunciation" />
        </div>
      </header>

      {definition ? (
        <section className="word-detail__section">
          <h2>Definition</h2>
          <p>{definition}</p>
        </section>
      ) : null}

      {entry.examples.length ? (
        <section className="word-detail__section">
          <h2>Example sentences</h2>
          <ul className="example-list">
            {entry.examples.map((example) => (
              <li key={example.id}>
                <p className="example-list__kweyol">{example.kweyolText}</p>
                <p className="example-list__english">{example.englishText}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {entry.grammaticalNotes ? (
        <section className="word-detail__section">
          <h2>Grammatical notes</h2>
          <p>{entry.grammaticalNotes}</p>
        </section>
      ) : null}

      {entry.usageNotes ? (
        <section className="word-detail__section">
          <h2>Usage notes</h2>
          <p>{entry.usageNotes}</p>
        </section>
      ) : null}

      {entry.culturalNotes ? (
        <section className="word-detail__section">
          <h2>Cultural notes</h2>
          <p>{entry.culturalNotes}</p>
        </section>
      ) : null}

      {entry.regionalWarning ? (
        <section className="word-detail__section word-detail__warning">
          <h2>Regional note</h2>
          <p>{entry.regionalWarning}</p>
        </section>
      ) : null}

      {(entry.pluralForm || entry.verbForms || entry.alternativeSpelling) && (
        <section className="word-detail__section">
          <h2>Forms</h2>
          <ul className="plain-list">
            {entry.pluralForm ? <li>Plural: {entry.pluralForm}</li> : null}
            {entry.verbForms ? <li>Verb forms: {entry.verbForms}</li> : null}
            {entry.alternativeSpelling ? (
              <li>Alternative spelling: {entry.alternativeSpelling}</li>
            ) : null}
          </ul>
        </section>
      )}

      {related.length ? (
        <section className="word-detail__section">
          <h2>Related words</h2>
          <ul className="related-list">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/dictionary/${item.slug}`}>{item.kweyolWord}</Link>
                <span> — {item.englishTranslation}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <WordActions
        slug={entry.slug}
        kweyolWord={entry.kweyolWord}
        englishTranslation={entry.englishTranslation}
      />

      <nav className="word-detail__nav" aria-label="Nearby words">
        {previous ? (
          <Link href={`/dictionary/${previous.slug}`}>
            Previous: {previous.kweyolWord}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/dictionary/${next.slug}`}>Next: {next.kweyolWord}</Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
