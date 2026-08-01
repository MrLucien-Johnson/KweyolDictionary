import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { dictionaryEntryInputSchema } from "@/lib/validation/dictionary-entry";

const importSchema = z.object({
  entries: z.array(dictionaryEntryInputSchema.partial()),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = importSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import JSON" }, { status: 400 });
  }

  let imported = 0;
  for (const entry of parsed.data.entries) {
    if (!entry.slug || !entry.kweyolWord || !entry.englishTranslation) continue;
    const reviewStatus = entry.reviewStatus ?? "DRAFT";
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
      detailJson: JSON.stringify({ imported, by: session.email }),
    },
  });

  return NextResponse.json({ imported });
}
