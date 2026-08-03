import { NextResponse } from "next/server";
import {
  requireAdminSession,
  requireCanApprove,
  requireCanEdit,
} from "@/lib/admin/require-session";
import { canApproveEntries } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { dictionaryEntryInputSchema } from "@/lib/validation/dictionary-entry";
import { z } from "zod";

const importSchema = z.object({
  entries: z.array(dictionaryEntryInputSchema.partial()),
});

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  const editGate = requireCanEdit(auth.session);
  if (editGate) return editGate;

  const json = await request.json().catch(() => null);
  const parsed = importSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import JSON" }, { status: 400 });
  }

  const wantsApproved = parsed.data.entries.some(
    (entry) => entry.reviewStatus === "APPROVED",
  );
  if (wantsApproved && !canApproveEntries(auth.session.role)) {
    const approveGate = requireCanApprove(auth.session);
    if (approveGate) return approveGate;
  }

  let imported = 0;
  for (const entry of parsed.data.entries) {
    if (!entry.slug || !entry.kweyolWord || !entry.englishTranslation) continue;
    let reviewStatus = entry.reviewStatus ?? "DRAFT";
    if (reviewStatus === "APPROVED" && !canApproveEntries(auth.session.role)) {
      reviewStatus = "DRAFT";
    }
    await prisma.dictionaryEntry.upsert({
      where: { slug: entry.slug },
      update: {
        kweyolWord: entry.kweyolWord,
        englishTranslation: entry.englishTranslation,
        partOfSpeech: entry.partOfSpeech,
        simpleDefinition: entry.simpleDefinition,
        detailedDefinition: entry.detailedDefinition,
        culturalNotes: entry.culturalNotes,
        topicCategory: entry.topicCategory,
        reviewStatus,
      },
      create: {
        slug: entry.slug,
        kweyolWord: entry.kweyolWord,
        englishTranslation: entry.englishTranslation,
        partOfSpeech: entry.partOfSpeech,
        simpleDefinition: entry.simpleDefinition,
        detailedDefinition: entry.detailedDefinition,
        culturalNotes: entry.culturalNotes,
        topicCategory: entry.topicCategory,
        reviewStatus,
      },
    });
    imported += 1;
  }

  await prisma.auditEvent.create({
    data: {
      action: "IMPORT",
      detailJson: JSON.stringify({
        imported,
        by: auth.session.email,
        role: auth.session.role,
      }),
    },
  });

  return NextResponse.json({ imported });
}
