import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { dictionaryEntryInputSchema } from "@/lib/validation/dictionary-entry";
import { slugifyKweyol } from "@/lib/search/normalize";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug =
    typeof body?.slug === "string" && body.slug
      ? body.slug
      : slugifyKweyol(String(body?.kweyolWord ?? ""));

  const parsed = dictionaryEntryInputSchema.safeParse({
    slug,
    kweyolWord: body?.kweyolWord,
    englishTranslation: body?.englishTranslation,
    partOfSpeech: body?.partOfSpeech || null,
    pronunciationGuide: body?.pronunciationGuide || null,
    simpleDefinition: body?.simpleDefinition || null,
    detailedDefinition: body?.detailedDefinition || null,
    culturalNotes: body?.culturalNotes || null,
    topicCategory: body?.topicCategory || null,
    reviewStatus: body?.reviewStatus || "DRAFT",
    childPresentation: body?.childSimpleMeaning
      ? { simpleMeaning: body.childSimpleMeaning }
      : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid entry" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const entry = await prisma.dictionaryEntry.create({
    data: {
      slug: data.slug,
      kweyolWord: data.kweyolWord,
      englishTranslation: data.englishTranslation,
      partOfSpeech: data.partOfSpeech,
      pronunciationGuide: data.pronunciationGuide,
      simpleDefinition: data.simpleDefinition,
      detailedDefinition: data.detailedDefinition,
      culturalNotes: data.culturalNotes,
      topicCategory: data.topicCategory,
      reviewStatus: data.reviewStatus,
      audience: data.childPresentation ? "BOTH" : "ADULT",
      adultPresentation: {
        create: {
          displayDefinition: data.detailedDefinition,
          showInPublicDictionary: data.reviewStatus === "APPROVED",
        },
      },
      ...(data.childPresentation
        ? {
            childPresentation: {
              create: {
                simpleMeaning: data.childPresentation.simpleMeaning,
                showInChildrenDictionary: data.reviewStatus === "APPROVED",
              },
            },
          }
        : {}),
    },
  });

  await prisma.changeHistory.create({
    data: {
      entryId: entry.id,
      entityType: "DictionaryEntry",
      entityId: entry.id,
      action: "CREATE",
      afterJson: JSON.stringify(data),
    },
  });

  await prisma.auditEvent.create({
    data: {
      action: "ENTRY_CREATE",
      detailJson: JSON.stringify({ entryId: entry.id, by: session.email }),
    },
  });

  return NextResponse.json({ id: entry.id, slug: entry.slug });
}
