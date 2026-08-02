import {
  getQuizForClient,
  listQuizzes,
  scoreQuizLocally,
} from "@/lib/content/catalog";

export async function listPublicQuizzes() {
  return listQuizzes();
}

export async function getQuizForPlay(slug: string) {
  return getQuizForClient(slug);
}

export async function scoreQuizAttempt(
  slug: string,
  answers: { questionId: string; answerId: string }[],
) {
  return scoreQuizLocally(slug, answers);
}
