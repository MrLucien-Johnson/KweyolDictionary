import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChildWordCard } from "@/components/children/ChildWordCard";
import { getChildWord, listChildWords } from "@/lib/children/queries";
import { CHILD_AGE_BAND_LABELS } from "@/lib/constants/age-groups";
import type { ChildAgeBandValue } from "@/lib/constants/age-groups";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const words = await listChildWords();
  return words.map((word) => ({ slug: word.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const word = await getChildWord(slug);
  return {
    title: word ? `${word.kweyolWord} for children` : "Children’s word",
    alternates: word ? { canonical: `/children/words/${word.slug}` } : undefined,
  };
}

export default async function ChildWordPage({ params }: Props) {
  const { slug } = await params;
  const word = await getChildWord(slug);
  if (!word || !word.childPresentation) notFound();

  const image = word.imageAssets[0];
  const audio = word.audioFiles.find((file) => file.status !== "MISSING");
  const ageBand = word.childPresentation.ageBand as ChildAgeBandValue;
  const age = CHILD_AGE_BAND_LABELS[ageBand];

  return (
    <div className="children-page">
      <ChildWordCard
        slug={word.slug}
        kweyolWord={word.kweyolWord}
        meaning={word.childPresentation.simpleMeaning}
        imageSrc={image?.filePath}
        imageStatus={image?.status}
        audioSrc={audio?.filePath}
        audioIsSynthetic={audio?.source === "SYNTHETIC_TTS"}
      />
      <section className="word-detail__section">
        <h2>Example</h2>
        <p className="example-list__kweyol">
          {word.childPresentation.shortExampleKweyol}
        </p>
        <p className="example-list__english">
          {word.childPresentation.shortExampleEnglish}
        </p>
      </section>
      {word.childPresentation.funFact ? (
        <section className="word-detail__section">
          <h2>Fun fact</h2>
          <p>{word.childPresentation.funFact}</p>
        </section>
      ) : null}
      {age ? (
        <p className="meta-pill">
          {age.label} · ages {age.ages}
        </p>
      ) : null}
      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/children/words" className="btn btn--soft btn--md">
          Back to picture words
        </Link>
      </div>
    </div>
  );
}
