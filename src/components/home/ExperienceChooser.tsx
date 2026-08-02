import { ButtonLink } from "@/components/ui/ButtonLink";

export function ExperienceChooser() {
  return (
    <section
      className="experience-chooser"
      aria-labelledby="experience-chooser-title"
    >
      <h2 id="experience-chooser-title" className="section-title">
        Choose how you want to learn
      </h2>
      <p className="section-lead">
        Two clear paths — no quiz required to get started.
      </p>
      <div className="experience-chooser__grid">
        <article className="experience-card experience-card--adult">
          <h3 className="experience-card__title">Adult Dictionary</h3>
          <p className="experience-card__text">
            Search, browse and study Dominican Kwéyòl with definitions,
            examples, pronunciation and cultural notes.
          </p>
          <ButtonLink href="/dictionary" variant="primary" size="lg">
            Open Adult Dictionary
          </ButtonLink>
        </article>
        <article className="experience-card experience-card--child">
          <h3 className="experience-card__title">Children’s Dictionary</h3>
          <p className="experience-card__text">
            A colourful, illustrated learning space with simple meanings,
            listen buttons and age-appropriate activities.
          </p>
          <ButtonLink href="/children" variant="secondary" size="lg">
            Open Children’s Dictionary
          </ButtonLink>
        </article>
      </div>
    </section>
  );
}
