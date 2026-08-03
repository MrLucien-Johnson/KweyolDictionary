import { NextResponse } from "next/server";
import { applyAcceptedSubmission } from "@/lib/admin/apply-submission";
import {
  forbid,
  requireAdminSession,
  requireCanAcceptSubmission,
} from "@/lib/admin/require-session";
import { prisma } from "@/lib/db";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");
  if (action !== "ACCEPT" && action !== "REJECT") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const submission = await prisma.communitySubmission.findUnique({
    where: { id },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (submission.status !== "PENDING" && submission.status !== "IN_REVIEW") {
    return NextResponse.json(
      { error: `Submission is already ${submission.status}` },
      { status: 409 },
    );
  }

  if (action === "REJECT") {
    const roleGate = requireCanAcceptSubmission(auth.session, submission.type);
    if (roleGate) return roleGate;

    const updated = await prisma.communitySubmission.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    await prisma.auditEvent.create({
      data: {
        action: "SUBMISSION_REJECT",
        detailJson: JSON.stringify({
          submissionId: id,
          type: submission.type,
          by: auth.session.email,
          role: auth.session.role,
        }),
      },
    });
    return NextResponse.json({ id: updated.id, status: updated.status });
  }

  const roleGate = requireCanAcceptSubmission(auth.session, submission.type);
  if (roleGate) return roleGate;

  if (submission.type === "AUDIO" && body.listenedConfirmed !== true) {
    return forbid(
      "Confirm you listened to the recording end-to-end before accepting audio.",
    );
  }

  let applyResult;
  try {
    applyResult = await applyAcceptedSubmission(submission);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Apply failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updated = await prisma.communitySubmission.update({
    where: { id },
    data: { status: "ACCEPTED" },
  });

  await prisma.auditEvent.create({
    data: {
      action: "SUBMISSION_ACCEPT",
      detailJson: JSON.stringify({
        submissionId: id,
        type: submission.type,
        by: auth.session.email,
        role: auth.session.role,
        apply: applyResult,
      }),
    },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    apply: applyResult,
  });
}
