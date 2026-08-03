import { existsSync } from "node:fs";
import path from "node:path";
import type {
  CommunitySubmission,
  SubmissionType,
} from "@/generated/prisma/client";
import { installCommunityAudio } from "@/lib/audio/install-community-audio";
import { prisma } from "@/lib/db";
import { slugifyKweyol } from "@/lib/search/normalize";

export type ApplySubmissionResult = {
  entryId?: string;
  slug?: string;
  action: string;
  message: string;
  audioInstalled?: boolean;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parsePayload(payloadJson: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(payloadJson) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fall through */
  }
  return {};
}

async function findEntryBySlugOrId(payload: Record<string, unknown>) {
  const slug = asString(payload.entrySlug) || asString(payload.slug);
  if (slug) {
    return prisma.dictionaryEntry.findUnique({ where: { slug } });
  }
  const id = asString(payload.entryId);
  if (id) {
    return prisma.dictionaryEntry.findUnique({ where: { id } });
  }
  return null;
}

/**
 * Apply an accepted community submission.
 * Text types create/update entries as DRAFT or NEEDS_REVIEW — never APPROVED.
 * AUDIO installs the reviewed file into public/audio (still PLACEHOLDER / not CONFIRMED).
 */
export async function applyAcceptedSubmission(
  submission: CommunitySubmission,
): Promise<ApplySubmissionResult> {
  const payload = parsePayload(submission.payloadJson);
  const type = submission.type as SubmissionType;

  if (type === "AUDIO") {
    return applyAudio(submission, payload);
  }
  if (type === "NEW_WORD") {
    return applyNewWord(payload, submission);
  }
  if (type === "CORRECTION") {
    return applyCorrection(payload, submission);
  }
  if (type === "EXAMPLE") {
    return applyExample(payload, submission);
  }
  if (type === "CULTURAL_NOTE") {
    return applyCulturalNote(payload, submission);
  }
  if (type === "ALTERNATIVE_SPELLING") {
    return applyAlternativeSpelling(payload, submission);
  }

  throw new Error(`Unsupported submission type: ${type}`);
}

async function applyAudio(
  submission: CommunitySubmission,
  payload: Record<string, unknown>,
): Promise<ApplySubmissionResult> {
  const slug = asString(payload.entrySlug) || asString(payload.slug);
  const relative = asString(payload.storedRelativePath);
  if (!slug) {
    throw new Error("Audio submission is missing entrySlug.");
  }
  if (!relative) {
    throw new Error(
      "Audio submission has no stored file. Install manually with content:accept-audio.",
    );
  }

  const sourceFile = path.isAbsolute(relative)
    ? relative
    : path.join(process.cwd(), relative);
  if (!existsSync(sourceFile)) {
    throw new Error(`Stored audio file missing: ${relative}`);
  }

  const installed = installCommunityAudio({ slug, sourceFile });
  const entry = await prisma.dictionaryEntry.findUnique({ where: { slug } });

  if (entry) {
    const fileName = `${slug}.mp3`;
    const filePath = `audio/${fileName}`;
    const existing = await prisma.audioAsset.findFirst({
      where: { entryId: entry.id, fileName },
    });
    if (existing) {
      await prisma.audioAsset.update({
        where: { id: existing.id },
        data: {
          filePath,
          status: "PLACEHOLDER",
          isVerifiedNative: false,
        },
      });
    } else {
      await prisma.audioAsset.create({
        data: {
          entryId: entry.id,
          fileName,
          filePath,
          status: "PLACEHOLDER",
          isVerifiedNative: false,
        },
      });
    }
  }

  const nextPayload = {
    ...payload,
    reviewState: "INSTALLED_AWAITING_PUBLISH",
    installedAt: new Date().toISOString(),
    installedPath: path.relative(process.cwd(), installed.targetPath),
    removedFromTtsManifest: installed.removedFromTtsManifest,
    submissionId: submission.id,
  };
  await prisma.communitySubmission.update({
    where: { id: submission.id },
    data: { payloadJson: JSON.stringify(nextPayload) },
  });

  return {
    entryId: entry?.id,
    slug,
    action: "AUDIO_INSTALLED",
    audioInstalled: true,
    message: entry
      ? `Installed recording for ${slug}. Run content:publish before deploy. Status stays PLACEHOLDER until native verification.`
      : `Installed recording for ${slug}, but no dictionary entry matched that slug yet. Run content:publish after linking the entry.`,
  };
}

async function applyNewWord(
  payload: Record<string, unknown>,
  submission: CommunitySubmission,
): Promise<ApplySubmissionResult> {
  const kweyolWord =
    asString(payload.kweyolWord) || asString(payload.word) || asString(payload.headword);
  const englishTranslation =
    asString(payload.englishTranslation) ||
    asString(payload.english) ||
    asString(payload.details);
  if (!kweyolWord || !englishTranslation) {
    throw new Error(
      "NEW_WORD submissions need kweyolWord and englishTranslation (or details as English).",
    );
  }

  const slug =
    asString(payload.entrySlug) ||
    asString(payload.slug) ||
    slugifyKweyol(kweyolWord);
  const existing = await prisma.dictionaryEntry.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(
      `Slug "${slug}" already exists. Accept as CORRECTION or choose another slug.`,
    );
  }

  const details = asString(payload.details);
  const entry = await prisma.dictionaryEntry.create({
    data: {
      slug,
      kweyolWord,
      englishTranslation,
      partOfSpeech: asString(payload.partOfSpeech) || null,
      simpleDefinition: details || englishTranslation,
      culturalNotes: asString(payload.culturalNotes) || null,
      topicCategory: asString(payload.topicCategory) || null,
      alternativeSpelling: asString(payload.alternativeSpelling) || null,
      sourceOrContributor: submission.submitterEmail || "community",
      reviewStatus: "NEEDS_REVIEW",
      audience: "ADULT",
      adultPresentation: {
        create: {
          displayDefinition: details || englishTranslation,
          showInPublicDictionary: false,
        },
      },
    },
  });

  await prisma.changeHistory.create({
    data: {
      entryId: entry.id,
      entityType: "DictionaryEntry",
      entityId: entry.id,
      action: "CREATE_FROM_SUBMISSION",
      afterJson: JSON.stringify({ submissionId: submission.id, slug }),
    },
  });

  return {
    entryId: entry.id,
    slug: entry.slug,
    action: "ENTRY_CREATED",
    message: `Created draft entry "${slug}" as NEEDS_REVIEW. Approve separately before public publish.`,
  };
}

async function applyCorrection(
  payload: Record<string, unknown>,
  submission: CommunitySubmission,
): Promise<ApplySubmissionResult> {
  const entry = await findEntryBySlugOrId(payload);
  if (!entry) {
    throw new Error("CORRECTION needs a matching entrySlug (or entryId).");
  }

  const englishTranslation =
    asString(payload.englishTranslation) || asString(payload.english);
  const kweyolWord = asString(payload.kweyolWord);
  const details = asString(payload.details);
  const simpleDefinition =
    asString(payload.simpleDefinition) || details || undefined;
  const culturalNotes = asString(payload.culturalNotes) || undefined;
  const pronunciationGuide = asString(payload.pronunciationGuide) || undefined;
  const partOfSpeech = asString(payload.partOfSpeech) || undefined;

  const beforeJson = JSON.stringify(entry);
  const wasApproved = entry.reviewStatus === "APPROVED";
  const nextStatus = wasApproved ? "NEEDS_REVIEW" : entry.reviewStatus;

  const updated = await prisma.dictionaryEntry.update({
    where: { id: entry.id },
    data: {
      ...(kweyolWord ? { kweyolWord } : {}),
      ...(englishTranslation ? { englishTranslation } : {}),
      ...(simpleDefinition ? { simpleDefinition } : {}),
      ...(culturalNotes ? { culturalNotes } : {}),
      ...(pronunciationGuide ? { pronunciationGuide } : {}),
      ...(partOfSpeech ? { partOfSpeech } : {}),
      reviewStatus: nextStatus,
      dateLastReviewed: new Date(),
    },
  });

  if (wasApproved) {
    await prisma.adultPresentation.updateMany({
      where: { entryId: entry.id },
      data: { showInPublicDictionary: false },
    });
  }

  await prisma.changeHistory.create({
    data: {
      entryId: entry.id,
      entityType: "DictionaryEntry",
      entityId: entry.id,
      action: "UPDATE_FROM_SUBMISSION",
      beforeJson,
      afterJson: JSON.stringify({
        submissionId: submission.id,
        updated: updated.id,
      }),
    },
  });

  return {
    entryId: updated.id,
    slug: updated.slug,
    action: "ENTRY_UPDATED",
    message:
      nextStatus === "NEEDS_REVIEW" && entry.reviewStatus === "APPROVED"
        ? `Applied correction to "${updated.slug}" and moved it to NEEDS_REVIEW for re-approval.`
        : `Applied correction to "${updated.slug}".`,
  };
}

async function applyExample(
  payload: Record<string, unknown>,
  submission: CommunitySubmission,
): Promise<ApplySubmissionResult> {
  const entry = await findEntryBySlugOrId(payload);
  if (!entry) {
    throw new Error("EXAMPLE needs a matching entrySlug (or entryId).");
  }

  const kweyolText =
    asString(payload.kweyolText) ||
    asString(payload.exampleKweyol) ||
    asString(payload.details);
  const englishText =
    asString(payload.englishText) ||
    asString(payload.exampleEnglish) ||
    asString(payload.englishTranslation);
  if (!kweyolText || !englishText) {
    throw new Error("EXAMPLE needs kweyolText and englishText (or details + english).");
  }

  const example = await prisma.exampleSentence.create({
    data: {
      entryId: entry.id,
      kweyolText,
      englishText,
      isPrimary: false,
      audience: "ADULT",
    },
  });

  await prisma.changeHistory.create({
    data: {
      entryId: entry.id,
      entityType: "ExampleSentence",
      entityId: example.id,
      action: "CREATE_FROM_SUBMISSION",
      afterJson: JSON.stringify({ submissionId: submission.id }),
    },
  });

  if (entry.reviewStatus === "APPROVED") {
    await prisma.dictionaryEntry.update({
      where: { id: entry.id },
      data: { reviewStatus: "NEEDS_REVIEW", dateLastReviewed: new Date() },
    });
    await prisma.adultPresentation.updateMany({
      where: { entryId: entry.id },
      data: { showInPublicDictionary: false },
    });
  }

  return {
    entryId: entry.id,
    slug: entry.slug,
    action: "EXAMPLE_ADDED",
    message: `Added example sentence to "${entry.slug}". Entry marked NEEDS_REVIEW if it was approved.`,
  };
}

async function applyCulturalNote(
  payload: Record<string, unknown>,
  submission: CommunitySubmission,
): Promise<ApplySubmissionResult> {
  const entry = await findEntryBySlugOrId(payload);
  if (!entry) {
    throw new Error("CULTURAL_NOTE needs a matching entrySlug (or entryId).");
  }

  const note =
    asString(payload.culturalNotes) ||
    asString(payload.details) ||
    asString(payload.note);
  if (!note) {
    throw new Error("CULTURAL_NOTE needs culturalNotes or details.");
  }

  const merged = entry.culturalNotes
    ? `${entry.culturalNotes.trim()}\n\n${note}`
    : note;

  await prisma.dictionaryEntry.update({
    where: { id: entry.id },
    data: {
      culturalNotes: merged,
      reviewStatus:
        entry.reviewStatus === "APPROVED" ? "NEEDS_REVIEW" : entry.reviewStatus,
      dateLastReviewed: new Date(),
    },
  });

  if (entry.reviewStatus === "APPROVED") {
    await prisma.adultPresentation.updateMany({
      where: { entryId: entry.id },
      data: { showInPublicDictionary: false },
    });
  }

  await prisma.changeHistory.create({
    data: {
      entryId: entry.id,
      entityType: "DictionaryEntry",
      entityId: entry.id,
      action: "CULTURAL_NOTE_FROM_SUBMISSION",
      afterJson: JSON.stringify({ submissionId: submission.id }),
    },
  });

  return {
    entryId: entry.id,
    slug: entry.slug,
    action: "CULTURAL_NOTE_ADDED",
    message: `Appended cultural note on "${entry.slug}".`,
  };
}

async function applyAlternativeSpelling(
  payload: Record<string, unknown>,
  submission: CommunitySubmission,
): Promise<ApplySubmissionResult> {
  const entry = await findEntryBySlugOrId(payload);
  if (!entry) {
    throw new Error(
      "ALTERNATIVE_SPELLING needs a matching entrySlug (or entryId).",
    );
  }

  const spelling =
    asString(payload.alternativeSpelling) ||
    asString(payload.kweyolWord) ||
    asString(payload.details);
  if (!spelling) {
    throw new Error("ALTERNATIVE_SPELLING needs alternativeSpelling or details.");
  }

  await prisma.dictionaryEntry.update({
    where: { id: entry.id },
    data: {
      alternativeSpelling: spelling,
      reviewStatus:
        entry.reviewStatus === "APPROVED" ? "NEEDS_REVIEW" : entry.reviewStatus,
      dateLastReviewed: new Date(),
    },
  });

  if (entry.reviewStatus === "APPROVED") {
    await prisma.adultPresentation.updateMany({
      where: { entryId: entry.id },
      data: { showInPublicDictionary: false },
    });
  }

  await prisma.changeHistory.create({
    data: {
      entryId: entry.id,
      entityType: "DictionaryEntry",
      entityId: entry.id,
      action: "ALT_SPELLING_FROM_SUBMISSION",
      afterJson: JSON.stringify({ submissionId: submission.id, spelling }),
    },
  });

  return {
    entryId: entry.id,
    slug: entry.slug,
    action: "ALT_SPELLING_SET",
    message: `Set alternative spelling on "${entry.slug}".`,
  };
}
