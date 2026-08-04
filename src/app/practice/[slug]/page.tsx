import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PracticeArcade } from "@/components/practice/PracticeArcade";
import {
  getPracticeGameMeta,
  listPracticeGames,
} from "@/lib/practice/games";

type PracticeGamePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listPracticeGames().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: PracticeGamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getPracticeGameMeta(slug);
  return {
    title: game?.title ?? "Practice game",
    description: game?.description,
  };
}

export default async function PracticeGamePage({ params }: PracticeGamePageProps) {
  const { slug } = await params;
  const meta = getPracticeGameMeta(slug);
  if (!meta) notFound();

  return (
    <div className="practice-page">
      <Suspense fallback={<p className="loading-line">Loading game…</p>}>
        <PracticeArcade slug={slug} />
      </Suspense>
      <p className="practice-player__back">
        <Link href="/practice" className="text-link">
          ← All practice games
        </Link>
      </p>
    </div>
  );
}
