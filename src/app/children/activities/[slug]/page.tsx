import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChildActivityPlayer } from "@/components/children/ChildActivityPlayer";
import {
  getChildActivity,
  listChildActivities,
} from "@/lib/children/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const activities = await listChildActivities();
  return activities.map((activity) => ({ slug: activity.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getChildActivity(slug);
  return {
    title: activity?.title ?? "Activity",
    robots: { index: false, follow: false },
  };
}

export default async function ChildActivityPage({ params }: Props) {
  const { slug } = await params;
  const activity = await getChildActivity(slug);
  if (!activity) notFound();

  return (
    <div className="children-page">
      <ChildActivityPlayer
        slug={activity.slug}
        title={activity.title}
        activityType={activity.activityType}
        configJson={activity.configJson ?? null}
      />
    </div>
  );
}
