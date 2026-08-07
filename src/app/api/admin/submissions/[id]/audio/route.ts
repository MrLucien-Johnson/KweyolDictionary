import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-session";
import { canReviewAudio } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";

type RouteProps = { params: Promise<{ id: string }> };

const MIME_BY_EXT: Record<string, string> = {
  ".webm": "audio/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
};

export async function GET(_request: Request, { params }: RouteProps) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  if (!canReviewAudio(auth.session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.communitySubmission.findUnique({
    where: { id },
  });
  if (!submission || submission.type !== "AUDIO") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let relative = "";
  let mimeType = "";
  try {
    const payload = JSON.parse(submission.payloadJson) as Record<string, unknown>;
    relative = String(payload.storedRelativePath ?? "");
    mimeType = String(payload.mimeType ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!relative.startsWith("storage/community-audio/")) {
    return NextResponse.json(
      { error: "No local audio file for this submission" },
      { status: 404 },
    );
  }

  const absolute = path.join(process.cwd(), relative);
  if (!existsSync(absolute)) {
    return NextResponse.json({ error: "Audio file missing on disk" }, { status: 404 });
  }

  const ext = path.extname(absolute).toLowerCase();
  const contentType = mimeType || MIME_BY_EXT[ext] || "application/octet-stream";
  const stream = Readable.toWeb(createReadStream(absolute)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
