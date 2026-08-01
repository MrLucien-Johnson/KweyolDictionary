import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await prisma.grammarLesson.findFirst({
    where: { slug, reviewStatus: "APPROVED" },
  });
  return { title: lesson?.title ?? "Lesson" };
}

export default async function GrammarLessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = await prisma.grammarLesson.findFirst({
    where: { slug, reviewStatus: "APPROVED" },
  });
  if (!lesson) notFound();

  const examples = JSON.parse(lesson.examplesJson) as {
    kweyol: string;
    english: string;
  }[];

  return (
    <article className="lesson-page">
      <header className="dict-page__header">
        <h1>{lesson.title}</h1>
        <p>{lesson.shortExplanation}</p>
      </header>

      <section className="word-detail__section">
        <h2>Examples</h2>
        <ul className="example-list">
          {examples.map((example) => (
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
            <Link href="/learn/quizzes/greetings-multiple-choice" className="btn btn--primary btn--md">
              Try a related quiz
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
