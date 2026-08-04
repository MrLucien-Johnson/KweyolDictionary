import type { Metadata } from "next";
import Link from "next/link";
import { ContentAccuracyNotice } from "@/components/layout/ContentAccuracyNotice";
import { PRACTICE_DIFFICULTY_CONFIG } from "@/lib/practice/difficulty";
import { listPracticeGames } from "@/lib/practice/games";

export const metadata: Metadata = {
  title: "Practice games",
  description:
    "Mini Kwéyòl sentence games with Easy, Medium and Hard modes — cloze and word-order challenges for adults and children.",
};

function GameCard({
  slug,
  title,
  description,
  activityType,
  accent = "leaf",
  ctaClass,
}: {
  slug: string;
  title: string;
  description: string;
  activityType: string;
  accent?: string;
  ctaClass: string;
}) {
  return (
    <article className={`arcade-card arcade-card--${accent}`}>
      <p className="practice-card__type">
        {activityType === "sentence-cloze" ? "Fill the blank" : "Build the sentence"}
      </p>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="arcade-card__levels">
        {(["easy", "medium", "hard"] as const).map((level) => (
          <Link
            key={level}
            href={`/practice/${slug}?difficulty=${level}`}
            className="arcade-card__level"
          >
            {PRACTICE_DIFFICULTY_CONFIG[level].label}
          </Link>
        ))}
      </div>
      <div style={{ marginTop: "0.85rem" }}>
        <Link href={`/practice/${slug}`} className={ctaClass}>
          Open lobby
        </Link>
      </div>
    </article>
  );
}

export default function PracticeHubPage() {
  const adultGames = listPracticeGames("ADULT");
  const kidsGames = listPracticeGames("CHILD");

  return (
    <div className="practice-page">
      <header className="dict-page__header">
        <h1>Practice games</h1>
        <p>
          MiniClip-style sentence games: pick a difficulty, beat the clock, keep
          your streak, and use real Kwéyòl words in complete sentences.
        </p>
      </header>
      <ContentAccuracyNotice variant="panel" />

      <section className="learn-section">
        <h2 className="section-title">Difficulty</h2>
        <div className="arcade-legend">
          <div>
            <strong>Easy</strong>
            <p>Hints on, no timer, three lives</p>
          </div>
          <div>
            <strong>Medium</strong>
            <p>20s rounds, streak & speed bonuses</p>
          </div>
          <div>
            <strong>Hard</strong>
            <p>12s rounds, no English hint, two lives</p>
          </div>
        </div>
      </section>

      <section className="learn-section">
        <h2 className="section-title">For adults & older learners</h2>
        <div className="feature-grid">
          {adultGames.map((game) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
              title={game.title}
              description={game.description}
              activityType={game.activityType}
              accent={game.accent}
              ctaClass="btn btn--primary btn--md"
            />
          ))}
        </div>
      </section>

      <section className="learn-section">
        <h2 className="section-title">For children</h2>
        <div className="feature-grid">
          {kidsGames.map((game) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
              title={game.title}
              description={game.description}
              activityType={game.activityType}
              accent={game.accent}
              ctaClass="btn btn--secondary btn--md"
            />
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
