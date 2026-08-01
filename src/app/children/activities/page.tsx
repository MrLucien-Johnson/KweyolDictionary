import type { Metadata } from "next";
import Link from "next/link";
import { listChildActivities } from "@/lib/children/queries";
import { CHILD_AGE_BAND_LABELS } from "@/lib/constants/age-groups";

export const metadata: Metadata = {
  title: "Children’s activities",
  description: "Picture games and gentle practice for Dominican Kwéyòl learners.",
};

export default async function ChildActivitiesPage() {
  const activities = await listChildActivities();

  return (
    <div className="children-page">
      <header className="dict-page__header">
        <h1>Activities</h1>
        <p>
          Games get a little more challenging as children grow. Progress stays on
          this device.
        </p>
      </header>
      <div className="feature-grid">
        {activities.map((activity) => (
          <article key={activity.id} className="feature-block">
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
            <p className="meta-pill">
              {CHILD_AGE_BAND_LABELS[activity.ageBand].label}
            </p>
            <div style={{ marginTop: "1rem" }}>
              <Link
                href={`/children/activities/${activity.slug}`}
                className="btn btn--secondary btn--md"
              >
                Play
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
