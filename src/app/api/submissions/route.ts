import { NextResponse } from "next/server";
import { communitySubmissionSchema } from "@/lib/validation/submission";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = communitySubmissionSchema.safeParse({
    type: json?.type,
    payload: json?.payload ?? {},
    submitterNote: json?.submitterNote,
    submitterEmail: json?.submitterEmail,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const created = await prisma.communitySubmission.create({
    data: {
      type: parsed.data.type,
      payloadJson: JSON.stringify(parsed.data.payload),
      submitterNote: parsed.data.submitterNote,
      submitterEmail: parsed.data.submitterEmail,
      status: "PENDING",
    },
  });

  return NextResponse.json({ id: created.id, status: created.status });
}
