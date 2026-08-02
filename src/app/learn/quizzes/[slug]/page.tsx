import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizPlayer } from "@/components/learning/QuizPlayer";
import { getCatalog } from "@/lib/content/catalog";
import { getQuizForPlay } from "@/lib/learning/quizzes";

type QuizPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCatalog().quizzes.map((quiz) => ({ slug: quiz.slug }));
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizForPlay(slug);
  return {
    title: quiz ? quiz.title : "Quiz",
    robots: { index: false, follow: false },
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug } = await params;
  const quiz = await getQuizForPlay(slug);
  if (!quiz) notFound();

  return (
    <div className="learn-page">
      <QuizPlayer
        slug={quiz.slug}
        title={quiz.title}
        questions={quiz.questions}
      />
    </div>
  );
}
