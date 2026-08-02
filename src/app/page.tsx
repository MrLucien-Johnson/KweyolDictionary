import Link from "next/link";
import { ExperienceChooser } from "@/components/home/ExperienceChooser";
import { HomeSearch } from "@/components/home/HomeSearch";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { WordCard } from "@/components/dictionary/WordCard";
import {
  CONTENT_DENSITY_NOTE,
  LANGUAGE_VARIATION_NOTE,
  MISSION_STATEMENT,
  PROJECT_NAME,
} from "@/lib/content/editorial";
import {
  getFeaturedEntries,
  getRecentEntries,
  getWordOfTheDay,
  getPublicCategories,
} from "@/lib/dictionary/queries";

export default async function HomePage() {
  const [wordOfDay, featured, recent, categories] = await Promise.all([
    getWordOfTheDay(),
    getFeaturedEntries(3),
    getRecentEntries(6),
    getPublicCategories(),
  ]);

  return (
    <>
      <section className="home-hero" aria-labelledby="home-brand">
        <div className="home-hero__backdrop" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="home-hero__locale">
            Dominica’s Kwéyòl · Adult & children’s learning
          </p>
          <h1 id="home-brand" className="home-hero__brand">
            {PROJECT_NAME}
          </h1>
          <p className="home-hero__mission">{MISSION_STATEMENT}</p>
          <HomeSearch />
        </div>
      </section>

      <div className="home-section">
        <ExperienceChooser />
      </div>

      <section className="home-section" aria-labelledby="wotd-title">
        <h2 id="wotd-title" className="section-title">
          Word of the Day
        </h2>
        {wordOfDay ? (
          <div className="wotd">
            <WordCard
              slug={wordOfDay.slug}
              kweyolWord={wordOfDay.kweyolWord}
              englishTranslation={wordOfDay.englishTranslation}
              partOfSpeech={wordOfDay.partOfSpeech}
              pronunciationGuide={wordOfDay.pronunciationGuide}
            />
          </div>
        ) : (
          <p className="section-lead">
            A daily approved word will appear here once eligible entries are
            published.
          </p>
        )}
      </section>

      <section className="home-section" aria-labelledby="featured-cats-title">
        <h2 id="featured-cats-title" className="section-title">
          Featured categories
        </h2>
        <div className="chip-row">
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category.id}
              href={`/dictionary?category=${category.key}`}
              className="chip-link"
            >
              {category.nameEn}
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="featured-learning-title">
        <h2 id="featured-learning-title" className="section-title">
          Pronunciation, culture and featured words
        </h2>
        <p className="section-lead">{LANGUAGE_VARIATION_NOTE}</p>
        <p className="section-lead">{CONTENT_DENSITY_NOTE}</p>
        <div className="feature-grid">
          <article className="feature-block">
            <h3>Pronunciation learning</h3>
            <p>
              Explore the alphabet, greetings and sentence patterns in the
              learning section.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <ButtonLink href="/learn" variant="soft">
                Explore learning
              </ButtonLink>
            </div>
          </article>
          {featured.map((entry) => (
            <WordCard
              key={entry.id}
              slug={entry.slug}
              kweyolWord={entry.kweyolWord}
              englishTranslation={entry.englishTranslation}
              partOfSpeech={entry.partOfSpeech}
              pronunciationGuide={entry.pronunciationGuide}
            />
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="recent-title">
        <h2 id="recent-title" className="section-title">
          Recently added words
        </h2>
        {recent.length ? (
          <div className="word-grid">
            {recent.map((entry) => (
              <WordCard
                key={entry.id}
                slug={entry.slug}
                kweyolWord={entry.kweyolWord}
                englishTranslation={entry.englishTranslation}
                partOfSpeech={entry.partOfSpeech}
                pronunciationGuide={entry.pronunciationGuide}
              />
            ))}
          </div>
        ) : (
          <p className="section-lead">No approved recent entries yet.</p>
        )}
      </section>

      <section className="home-section" aria-labelledby="contribute-title">
        <h2 id="contribute-title" className="section-title">
          Help grow the dictionary
        </h2>
        <p className="section-lead">
          Speakers, teachers and community members can suggest words,
          corrections, examples and cultural explanations. All submissions are
          moderated before publication.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <ButtonLink href="/contribute" variant="primary" size="lg">
            Suggest a contribution
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
