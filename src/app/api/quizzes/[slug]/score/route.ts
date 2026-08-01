import { NextResponse } from "next/server";
import { z } from "zod";
import { scoreQuizAttempt } from "@/lib/learning/quizzes";

const bodySchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answerId: z.string().min(1),
    }),
  ),
});

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await scoreQuizAttempt(slug, parsed.data.answers);
  if (!result) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
