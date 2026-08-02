import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PronunciationAid } from "@/components/dictionary/PronunciationAid";
import { WordActions } from "@/components/dictionary/WordActions";
import { ContentAccuracyNotice } from "@/components/layout/ContentAccuracyNotice";
import { getCatalog, listEntries } from "@/lib/content/catalog";
import {
  getAdjacentEntries,
  getEntryBySlug,
} from "@/lib/dictionary/queries";

type WordPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listEntries({}).map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: WordPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Word not found" };
  return {
    title: `${entry.kweyolWord} — ${entry.englishTranslation}`,
    description:
      entry.simpleDefinition ??
      `${entry.kweyolWord}: ${entry.englishTranslation} in Dominican Kwéyòl.`,
    alternates: { canonical: `/dictionary/${entry.slug}` },
  };
}

export default async function WordDetailPage({ params }: WordPageProps) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  const { previous, next } = await getAdjacentEntries(entry.slug);
  const audio = entry.audioFiles.find((file) => file.status !== "MISSING");
  const relatedEntries = entry.relatedSlugs
    .map((slug) => getCatalog().entries.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const definition =
    entry.adultPresentation?.displayDefinition ||
    entry.detailedDefinition ||
    entry.simpleDefinition;

  return (
    <article className="word-detail">
      <ContentAccuracyNotice variant="panel" />
      <header className="word-detail__header">
        <p className="word-detail__eyebrow">Dominican Kwéyòl · provisional entry</p>
        <h1 className="word-detail__word">{entry.kweyolWord}</h1>
        <p className="word-detail__english">{entry.englishTranslation}</p>
        <div className="word-detail__meta">
          {entry.partOfSpeech ? (
            <span className="meta-pill">{entry.partOfSpeech}</span>
          ) : null}
          {entry.pronunciationGuide ? (
            <span className="word-detail__pron">/{entry.pronunciationGuide}/</span>
          ) : null}
        </div>
        <PronunciationAid
          kweyolWord={entry.kweyolWord}
          audioSrc={audio?.filePath}
          featured={entry.isFeatured}
        />
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

      {relatedEntries.length ? (
        <section className="word-detail__section">
          <h2>Same spelling, different meaning</h2>
          <p>
            This headword has more than one beginner sense. Open the matching
            entry for the meaning you need.
          </p>
          <ul className="related-sense-list">
            {relatedEntries.map((related) => (
              <li key={related.slug}>
                <Link href={`/dictionary/${related.slug}`}>
                  {related.kweyolWord} — {related.englishTranslation}
                </Link>
                {related.partOfSpeech ? (
                  <span className="meta-pill">{related.partOfSpeech}</span>
                ) : null}
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
