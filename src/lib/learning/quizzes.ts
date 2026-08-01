import { prisma } from "@/lib/db";

/** Public quiz payloads never include which answers are correct. */
export async function listPublicQuizzes(audience: "ADULT" | "CHILD" | "BOTH" = "ADULT") {
  return prisma.quiz.findMany({
    where: {
      reviewStatus: "APPROVED",
      audience: audience === "BOTH" ? undefined : { in: [audience, "BOTH"] },
    },
    select: {
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      audience: true,
    },
    orderBy: { title: "asc" },
  });
}

export async function getQuizForPlay(slug: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { slug, reviewStatus: "APPROVED" },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          answers: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              answerText: true,
              sortOrder: true,
              // intentionally omit isCorrect from client payload
            },
          },
        },
      },
    },
  });
  return quiz;
}

export async function scoreQuizAttempt(
  slug: string,
  answers: { questionId: string; answerId: string }[],
) {
  const quiz = await prisma.quiz.findFirst({
    where: { slug, reviewStatus: "APPROVED" },
    include: {
      questions: {
        include: { answers: true },
      },
    },
  });
  if (!quiz) return null;

  const results = quiz.questions.map((question) => {
    const submitted = answers.find((answer) => answer.questionId === question.id);
    const correct = question.answers.find((answer) => answer.isCorrect);
    const chosen = question.answers.find((answer) => answer.id === submitted?.answerId);
    const isCorrect = Boolean(chosen?.isCorrect);
    return {
      questionId: question.id,
      prompt: question.prompt,
      isCorrect,
      explanation: question.explanation,
      correctAnswerText: correct?.answerText ?? null,
      chosenAnswerText: chosen?.answerText ?? null,
    };
  });

  const score = results.filter((result) => result.isCorrect).length;
  return {
    quizTitle: quiz.title,
    total: results.length,
    score,
    results,
  };
}
