import { ExperienceChooser } from "@/components/home/ExperienceChooser";
import { HomeSearch } from "@/components/home/HomeSearch";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  LANGUAGE_VARIATION_NOTE,
  MISSION_STATEMENT,
  PROJECT_NAME,
} from "@/lib/content/editorial";

export default function HomePage() {
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

      <section
        className="home-section"
        aria-labelledby="featured-learning-title"
      >
        <h2 id="featured-learning-title" className="section-title">
          Start with sound, culture and daily words
        </h2>
        <p className="section-lead">
          Foundation pages are in place. Dictionary search, children’s
          illustrations and full lesson content land in the next phases.
        </p>
        <div className="feature-grid">
          <article className="feature-block">
            <h3>Word of the Day</h3>
            <p>
              A daily Dominican Kwéyòl word will appear here once approved
              entries are published.
            </p>
            <span className="status-chip">Coming in Phase 3</span>
          </article>
          <article className="feature-block">
            <h3>Pronunciation learning</h3>
            <p>
              Learn the alphabet, common letter combinations and listening
              practice for Dominica’s Kwéyòl sounds.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <ButtonLink href="/learn" variant="soft">
                Explore learning
              </ButtonLink>
            </div>
          </article>
          <article className="feature-block">
            <h3>Cultural feature</h3>
            <p>{LANGUAGE_VARIATION_NOTE}</p>
          </article>
        </div>
      </section>

      <section
        className="home-section"
        aria-labelledby="contribute-title"
      >
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
