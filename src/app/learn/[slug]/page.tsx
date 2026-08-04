import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, listLessons } from "@/lib/content/catalog";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function GrammarLessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <article className="lesson-page">
      <header className="dict-page__header">
        <h1>{lesson.title}</h1>
        <p>{lesson.shortExplanation}</p>
      </header>

      <section className="word-detail__section">
        <h2>Examples</h2>
        <ul className="example-list">
          {lesson.examples.map((example) => (
            <li key={`${example.kweyol}-${example.english}`}>
              <p className="example-list__kweyol">{example.kweyol}</p>
              <p className="example-list__english">{example.english}</p>
            </li>
          ))}
        </ul>
      </section>

      {lesson.pronunciationSupport ? (
        <section className="word-detail__section">
          <h2>Pronunciation support</h2>
          <p>{lesson.pronunciationSupport}</p>
        </section>
      ) : null}

      {lesson.commonMistakes ? (
        <section className="word-detail__section">
          <h2>Common mistakes</h2>
          <p>{lesson.commonMistakes}</p>
        </section>
      ) : null}

      {lesson.practiceActivity ? (
        <section className="word-detail__section">
          <h2>Practice activity</h2>
          <p>{lesson.practiceActivity}</p>
          <div style={{ marginTop: "1rem" }}>
            <Link
              href="/practice/featured-sentence-tiles"
              className="btn btn--primary btn--md"
            >
              Build sentences
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
