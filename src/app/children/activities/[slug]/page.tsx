import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChildActivityPlayer } from "@/components/children/ChildActivityPlayer";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await prisma.childActivity.findFirst({
    where: { slug, reviewStatus: "APPROVED" },
  });
  return {
    title: activity?.title ?? "Activity",
    robots: { index: false, follow: false },
  };
}

export default async function ChildActivityPage({ params }: Props) {
  const { slug } = await params;
  const activity = await prisma.childActivity.findFirst({
    where: { slug, reviewStatus: "APPROVED" },
  });
  if (!activity) notFound();

  return (
    <div className="children-page">
      <ChildActivityPlayer
        slug={activity.slug}
        title={activity.title}
        activityType={activity.activityType}
        configJson={activity.configJson}
      />
    </div>
  );
}
