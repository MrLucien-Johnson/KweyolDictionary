import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  COMMUNITY_AUDIO_CHECKLIST,
  COMMUNITY_AUDIO_MAX_BYTES,
  precheckCommunityAudio,
  type CommunityAudioChecklistId,
} from "@/lib/audio/community-audio";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function parseChecklist(raw: FormDataEntryValue | null) {
  const parsed = JSON.parse(String(raw || "{}")) as Record<string, boolean>;
  return COMMUNITY_AUDIO_CHECKLIST.reduce(
    (acc, item) => {
      acc[item.id] = Boolean(parsed[item.id]);
      return acc;
    },
    {} as Record<CommunityAudioChecklistId, boolean>,
  );
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Audio file required" }, { status: 400 });
  }

  const entrySlug = String(form.get("entrySlug") ?? "");
  const kweyolWord = String(form.get("kweyolWord") ?? "");
  const englishTranslation = String(form.get("englishTranslation") ?? "");
  const regionNote = String(form.get("regionNote") ?? "");
  const submitterNote = String(form.get("submitterNote") ?? "");
  const durationRaw = String(form.get("durationSeconds") ?? "");
  const durationSeconds = durationRaw ? Number(durationRaw) : null;
  const listened = String(form.get("listened") ?? "") === "true";
  const checklist = parseChecklist(form.get("checklist"));

  const precheck = precheckCommunityAudio({
    fileName: audio.name,
    mimeType: audio.type,
    byteLength: audio.size,
    durationSeconds,
    listened,
    checklist,
    entrySlug,
    kweyolWord,
  });

  if (!precheck.ok) {
    return NextResponse.json(
      { error: "Pre-verification failed", errors: precheck.errors },
      { status: 400 },
    );
  }

  if (audio.size > COMMUNITY_AUDIO_MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const bytes = Buffer.from(await audio.arrayBuffer());
  const safeSlug = entrySlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "word";
  const ext = path.extname(audio.name) || ".webm";
  const storedName = `${Date.now()}-${safeSlug}${ext}`;
  const storageDir = path.join(process.cwd(), "storage", "community-audio");
  mkdirSync(storageDir, { recursive: true });
  const absolutePath = path.join(storageDir, storedName);
  writeFileSync(absolutePath, bytes);

  const created = await prisma.communitySubmission.create({
    data: {
      type: "AUDIO",
      status: "PENDING",
      submitterNote: submitterNote || null,
      payloadJson: JSON.stringify({
        entrySlug,
        kweyolWord,
        englishTranslation,
        regionNote,
        durationSeconds,
        listened,
        checklist,
        originalFileName: audio.name,
        mimeType: audio.type,
        byteLength: audio.size,
        storedRelativePath: path.join("storage", "community-audio", storedName),
        reviewState: "AWAITING_METICULOUS_REVIEW",
        replacesSyntheticOnlyAfterAccept: true,
      }),
    },
  });

  return NextResponse.json({
    id: created.id,
    status: created.status,
    message:
      "Queued for review. Audio will not replace synthetic TTS until accepted and published.",
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: "node",
    accepts: ["multipart/form-data"],
  });
}
