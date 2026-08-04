import type { Metadata } from "next";
import Link from "next/link";
import { ContentAccuracyNotice } from "@/components/layout/ContentAccuracyNotice";
import { listPracticeGames } from "@/lib/practice/games";

export const metadata: Metadata = {
  title: "Practice games",
  description:
    "Sentence practice games for Dominican Kwéyòl — cloze and word-order drills for adults and children.",
};

export default function PracticeHubPage() {
  const adultGames = listPracticeGames("ADULT");
  const kidsGames = listPracticeGames("CHILD");

  return (
    <div className="practice-page">
      <header className="dict-page__header">
        <h1>Practice games</h1>
        <p>
          Use common Kwéyòl words in complete sentences. Start with featured and
          everyday vocabulary, then build the sentence or fill the blank.
        </p>
      </header>
      <ContentAccuracyNotice variant="panel" />

      <section className="learn-section">
        <h2 className="section-title">For adults & older learners</h2>
        <p className="section-lead">
          Cloze and word-order games drawn from dictionary example sentences.
        </p>
        <div className="feature-grid">
          {adultGames.map((game) => (
            <article key={game.slug} className="feature-block">
              <p className="practice-card__type">
                {game.activityType === "sentence-cloze"
                  ? "Fill the blank"
                  : "Build the sentence"}
              </p>
              <h3>{game.title}</h3>
              <p>{game.description}</p>
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={`/practice/${game.slug}`}
                  className="btn btn--primary btn--md"
                >
                  Play
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-section">
        <h2 className="section-title">For children</h2>
        <p className="section-lead">
          Shorter sentences and everyday words, with the same sentence-first idea.
        </p>
        <div className="feature-grid">
          {kidsGames.map((game) => (
            <article key={game.slug} className="feature-block">
              <p className="practice-card__type">
                {game.activityType === "sentence-cloze"
                  ? "Fill the blank"
                  : "Line up the words"}
              </p>
              <h3>{game.title}</h3>
              <p>{game.description}</p>
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={`/practice/${game.slug}`}
                  className="btn btn--secondary btn--md"
                >
                  Play
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-section">
        <h2 className="section-title">More learning</h2>
        <div className="tile-row">
          <Link href="/learn" className="btn btn--soft btn--md">
            Grammar lessons
          </Link>
          <Link href="/learn/flashcards" className="btn btn--soft btn--md">
            Flashcards
          </Link>
          <Link href="/children/activities" className="btn btn--soft btn--md">
            Children’s activities
          </Link>
        </div>
      </section>
    </div>
  );
}
