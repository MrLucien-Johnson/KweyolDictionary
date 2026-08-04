import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticeGamePlayer } from "@/components/practice/PracticeGamePlayer";
import {
  buildPracticeGame,
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
  const game = buildPracticeGame(slug);
  return {
    title: game?.title ?? "Practice game",
    description: game?.description,
  };
}

export default async function PracticeGamePage({ params }: PracticeGamePageProps) {
  const { slug } = await params;
  const game = buildPracticeGame(slug);
  if (!game) notFound();

  return (
    <div className="practice-page">
      <PracticeGamePlayer game={game} />
      <p className="practice-player__back">
        <Link href="/practice" className="text-link">
          ← All practice games
        </Link>
      </p>
    </div>
  );
}
