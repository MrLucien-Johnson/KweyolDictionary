import Link from "next/link";
import { NativeAudioPriority } from "@/components/audio/NativeAudioPriority";
import { ExperienceChooser } from "@/components/home/ExperienceChooser";
import { HomeSearch } from "@/components/home/HomeSearch";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { WordCard } from "@/components/dictionary/WordCard";
import { pickPlayableAudio } from "@/lib/audio/pick";
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
import type { PublishedEntry } from "@/lib/content/types";

function wordCardAudio(entry: PublishedEntry) {
  const audio = pickPlayableAudio(entry);
  return {
    audioSrc: audio?.filePath,
    audioSource: audio?.source,
  };
}

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
              {...wordCardAudio(wordOfDay)}
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

      <section className="home-section" aria-labelledby="practice-learn-title">
        <h2 id="practice-learn-title" className="section-title">
          Practice & learn
        </h2>
        <p className="section-lead">{LANGUAGE_VARIATION_NOTE}</p>
        <div className="feature-grid feature-grid--cta">
          <article className="feature-block">
            <h3>Sentence practice</h3>
            <p>
              Practise common words in full sentences with cloze and word-order
              games for adults and children.
            </p>
            <div className="feature-block__action">
              <ButtonLink href="/practice" variant="primary">
                Play practice games
              </ButtonLink>
            </div>
          </article>
          <article className="feature-block">
            <h3>Pronunciation learning</h3>
            <p>
              Explore the alphabet, greetings and sentence patterns in the
              learning section.
            </p>
            <div className="feature-block__action">
              <ButtonLink href="/learn" variant="soft">
                Explore learning
              </ButtonLink>
            </div>
          </article>
        </div>
      </section>

      <section className="home-section" aria-labelledby="featured-words-title">
        <h2 id="featured-words-title" className="section-title">
          Featured words
        </h2>
        <p className="section-lead">{CONTENT_DENSITY_NOTE}</p>
        {featured.length ? (
          <div className="word-grid">
            {featured.map((entry) => (
              <WordCard
                key={entry.id}
                slug={entry.slug}
                kweyolWord={entry.kweyolWord}
                englishTranslation={entry.englishTranslation}
                partOfSpeech={entry.partOfSpeech}
                pronunciationGuide={entry.pronunciationGuide}
                {...wordCardAudio(entry)}
              />
            ))}
          </div>
        ) : (
          <p className="section-lead">No featured entries yet.</p>
        )}
      </section>

      <div className="home-section">
        <NativeAudioPriority limit={8} />
      </div>

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
                {...wordCardAudio(entry)}
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
          Speakers can record Dominican Kwéyòl, suggest words, corrections and
          cultural notes. Every contribution is moderated before publication.
        </p>
        <div className="home-section__action">
          <ButtonLink href="/contribute?type=AUDIO" variant="primary" size="lg">
            Record native audio
          </ButtonLink>
          <ButtonLink href="/contribute" variant="soft" size="lg">
            Other contributions
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
