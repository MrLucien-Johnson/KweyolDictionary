import { NextResponse } from "next/server";
import {
  requireAdminSession,
  requireApprovalPermission,
  requireCanEdit,
} from "@/lib/admin/require-session";
import { prisma } from "@/lib/db";
import { reviewStatusSchema } from "@/lib/validation/dictionary-entry";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  const editGate = requireCanEdit(auth.session);
  if (editGate) return editGate;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const existing = await prisma.dictionaryEntry.findUnique({
    where: { id },
    include: { childPresentation: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reviewStatus = reviewStatusSchema.catch(existing.reviewStatus).parse(
    body?.reviewStatus ?? existing.reviewStatus,
  );

  const approveGate = requireApprovalPermission(
    auth.session,
    reviewStatus,
    existing.reviewStatus,
  );
  if (approveGate) return approveGate;

  const beforeJson = JSON.stringify(existing);
  const updated = await prisma.dictionaryEntry.update({
    where: { id },
    data: {
      slug: String(body?.slug ?? existing.slug),
      kweyolWord: String(body?.kweyolWord ?? existing.kweyolWord),
      englishTranslation: String(
        body?.englishTranslation ?? existing.englishTranslation,
      ),
      partOfSpeech: body?.partOfSpeech || null,
      pronunciationGuide: body?.pronunciationGuide || null,
      simpleDefinition: body?.simpleDefinition || null,
      detailedDefinition: body?.detailedDefinition || null,
      culturalNotes: body?.culturalNotes || null,
      topicCategory: body?.topicCategory || null,
      reviewStatus,
      dateLastReviewed: new Date(),
    },
  });

  await prisma.adultPresentation.upsert({
    where: { entryId: id },
    update: {
      showInPublicDictionary: reviewStatus === "APPROVED",
      displayDefinition:
        body?.detailedDefinition ||
        existing.detailedDefinition ||
        undefined,
    },
    create: {
      entryId: id,
      displayDefinition: body?.detailedDefinition || existing.detailedDefinition,
      showInPublicDictionary: reviewStatus === "APPROVED",
    },
  });

  if (body?.childSimpleMeaning) {
    await prisma.childPresentation.upsert({
      where: { entryId: id },
      update: {
        simpleMeaning: String(body.childSimpleMeaning),
        showInChildrenDictionary: reviewStatus === "APPROVED",
      },
      create: {
        entryId: id,
        simpleMeaning: String(body.childSimpleMeaning),
        showInChildrenDictionary: reviewStatus === "APPROVED",
      },
    });
  } else if (existing.childPresentation) {
    await prisma.childPresentation.update({
      where: { entryId: id },
      data: { showInChildrenDictionary: reviewStatus === "APPROVED" },
    });
  }

  await prisma.changeHistory.create({
    data: {
      entryId: id,
      entityType: "DictionaryEntry",
      entityId: id,
      action: "UPDATE",
      beforeJson,
      afterJson: JSON.stringify(updated),
    },
  });

  await prisma.auditEvent.create({
    data: {
      action: "ENTRY_UPDATE",
      detailJson: JSON.stringify({
        entryId: id,
        by: auth.session.email,
        role: auth.session.role,
      }),
    },
  });

  return NextResponse.json({ id: updated.id, slug: updated.slug });
}
