import type { Metadata } from "next";
import Link from "next/link";
import { listLessons } from "@/lib/content/catalog";
import { listPublicQuizzes } from "@/lib/learning/quizzes";

export const metadata: Metadata = {
  title: "Grammar & learning",
  description:
    "Adult grammar lessons, flashcards and practice for Dominican Kwéyòl.",
};

export default async function LearnPage() {
  const [lessons, quizzes] = await Promise.all([
    Promise.resolve(listLessons()),
    listPublicQuizzes(),
  ]);

  return (
    <div className="learn-page">
      <header className="dict-page__header">
        <h1>Grammar & learning</h1>
        <p>
          Build confidence with pronunciation, sentence patterns and short
          practice activities. Quiz answers stay inside the quiz experience.
        </p>
      </header>

      <section className="learn-section">
        <h2 className="section-title">Lessons</h2>
        <div className="feature-grid">
          {lessons.map((lesson) => (
            <article key={lesson.slug} className="feature-block">
              <h3>{lesson.title}</h3>
              <p>{lesson.shortExplanation}</p>
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="btn btn--soft btn--md"
                >
                  Open lesson
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-section">
        <h2 className="section-title">Practice</h2>
        <div className="feature-grid">
          <article className="feature-block">
            <h3>Flashcards</h3>
            <p>Review approved vocabulary with simple flip cards.</p>
            <div style={{ marginTop: "1rem" }}>
              <Link href="/learn/flashcards" className="btn btn--soft btn--md">
                Start flashcards
              </Link>
            </div>
          </article>
          {quizzes.map((quiz) => (
            <article key={quiz.slug} className="feature-block">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={`/learn/quizzes/${quiz.slug}`}
                  className="btn btn--soft btn--md"
                >
                  Take quiz
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
