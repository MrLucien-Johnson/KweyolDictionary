import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

type RouteProps = { params: Promise<{ id: string }> };

async function moderate(id: string, action: string) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (action !== "ACCEPT" && action !== "REJECT") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.communitySubmission.update({
    where: { id },
    data: {
      status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED",
    },
  });

  await prisma.auditEvent.create({
    data: {
      action: `SUBMISSION_${action}`,
      detailJson: JSON.stringify({ submissionId: id, by: session.email }),
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return moderate(id, String(body.action ?? ""));
}
