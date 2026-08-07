import type { Metadata } from "next";
import Link from "next/link";
import { listChildActivities, listChildCategories } from "@/lib/children/queries";
import { ChildrenSearch } from "@/components/children/ChildrenSearch";
import { ChildProgressPanel } from "@/components/children/ChildProgressPanel";
import { ContentAccuracyNotice } from "@/components/layout/ContentAccuracyNotice";
import { PublicImage } from "@/components/ui/PublicImage";

export const metadata: Metadata = {
  title: "Children’s Dictionary",
  description:
    "A child-friendly Dominican Kwéyòl learning dictionary with pictures and activities.",
};

export default async function ChildrenHomePage() {
  const [categories, activities] = await Promise.all([
    listChildCategories(),
    listChildActivities(),
  ]);

  return (
    <div className="children-page">
      <header className="children-hero">
        <h1>Children’s Kwéyòl Dictionary</h1>
        <p>
          Colourful words, listen buttons and gentle games for ages 4–12. No
          account needed.
        </p>
        <div className="children-hero__actions">
          <Link href="/children/words" className="btn btn--secondary btn--lg">
            Browse picture words
          </Link>
          <Link href="/practice/kids-everyday-cloze" className="btn btn--primary btn--lg">
            Sentence games
          </Link>
          <Link href="/children/activities" className="btn btn--soft btn--lg">
            More activities
          </Link>
        </div>
        <ChildrenSearch formClassName="children-search children-search--hero" />
      </header>

      <ContentAccuracyNotice audience="children" variant="panel" />

      <ChildProgressPanel />

      <section className="learn-section">
        <h2 className="section-title">Choose a category</h2>
        <p className="section-lead">
          Big picture categories make it easy to explore Dominica’s Kwéyòl.
        </p>
        <div className="child-category-grid">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/children/categories/${category.key}`}
              className="child-category-card"
            >
              <PublicImage
                src={category.imagePath}
                alt=""
                width={120}
                height={120}
              />
              <span className="child-category-card__title">{category.nameEn}</span>
              <span className="child-category-card__count">
                {category.count} {category.count === 1 ? "word" : "words"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="learn-section">
        <h2 className="section-title">Try an activity</h2>
        <div className="feature-grid">
          {activities.slice(0, 3).map((activity) => (
            <article key={activity.id} className="feature-block">
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              <div className="feature-block__action">
                <Link
                  href={`/children/activities/${activity.slug}`}
                  className="btn btn--soft btn--md"
                >
                  Play
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
