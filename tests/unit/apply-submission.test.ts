import { beforeEach, describe, expect, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const {
  findUnique,
  createEntry,
  updateEntry,
  createExample,
  createChange,
  updateSubmission,
  findAudio,
  createAudio,
  updateAudio,
  updateManyAdult,
} = vi.hoisted(() => ({
  findUnique: vi.fn(),
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  createExample: vi.fn(),
  createChange: vi.fn(),
  updateSubmission: vi.fn(),
  findAudio: vi.fn(),
  createAudio: vi.fn(),
  updateAudio: vi.fn(),
  updateManyAdult: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    dictionaryEntry: {
      findUnique,
      create: createEntry,
      update: updateEntry,
    },
    exampleSentence: { create: createExample },
    changeHistory: { create: createChange },
    communitySubmission: { update: updateSubmission },
    audioAsset: {
      findFirst: findAudio,
      create: createAudio,
      update: updateAudio,
    },
    adultPresentation: { updateMany: updateManyAdult },
  },
}));

vi.mock("@/lib/audio/install-community-audio", () => ({
  installCommunityAudio: vi.fn(() => ({
    targetPath: "/workspace/public/audio/bonjou.mp3",
    removedFromTtsManifest: true,
  })),
}));

import { applyAcceptedSubmission } from "@/lib/admin/apply-submission";
import { installCommunityAudio } from "@/lib/audio/install-community-audio";

describe("applyAcceptedSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createChange.mockResolvedValue({});
    updateSubmission.mockResolvedValue({});
    updateManyAdult.mockResolvedValue({});
  });

  it("creates a NEEDS_REVIEW entry for NEW_WORD", async () => {
    findUnique.mockResolvedValue(null);
    createEntry.mockResolvedValue({ id: "e1", slug: "nouvo" });

    const result = await applyAcceptedSubmission({
      id: "s1",
      type: "NEW_WORD",
      status: "PENDING",
      payloadJson: JSON.stringify({
        kweyolWord: "nouvo",
        englishTranslation: "new",
        details: "brand new word",
      }),
      submitterNote: null,
      submitterEmail: "a@b.co",
      reviewerId: null,
      contributorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.action).toBe("ENTRY_CREATED");
    expect(createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "nouvo",
          reviewStatus: "NEEDS_REVIEW",
        }),
      }),
    );
  });

  it("updates an entry for CORRECTION and demotes APPROVED", async () => {
    findUnique.mockResolvedValue({
      id: "e1",
      slug: "bonjou",
      reviewStatus: "APPROVED",
      culturalNotes: null,
    });
    updateEntry.mockResolvedValue({ id: "e1", slug: "bonjou" });

    const result = await applyAcceptedSubmission({
      id: "s2",
      type: "CORRECTION",
      status: "PENDING",
      payloadJson: JSON.stringify({
        entrySlug: "bonjou",
        englishTranslation: "hello / good morning",
      }),
      submitterNote: null,
      submitterEmail: null,
      reviewerId: null,
      contributorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.action).toBe("ENTRY_UPDATED");
    expect(updateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          englishTranslation: "hello / good morning",
          reviewStatus: "NEEDS_REVIEW",
        }),
      }),
    );
    expect(updateManyAdult).toHaveBeenCalled();
  });

  it("installs AUDIO when the stored file exists", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "kweyol-sub-"));
    const storageDir = path.join(root, "storage", "community-audio");
    mkdirSync(storageDir, { recursive: true });
    writeFileSync(path.join(storageDir, "x.mp3"), "bytes");
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);
    findUnique.mockResolvedValue({ id: "e1", slug: "bonjou" });
    findAudio.mockResolvedValue(null);
    createAudio.mockResolvedValue({});

    try {
      const result = await applyAcceptedSubmission({
        id: "s3",
        type: "AUDIO",
        status: "PENDING",
        payloadJson: JSON.stringify({
          entrySlug: "bonjou",
          storedRelativePath: "storage/community-audio/x.mp3",
        }),
        submitterNote: null,
        submitterEmail: null,
        reviewerId: null,
        contributorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(installCommunityAudio).toHaveBeenCalled();
      expect(result.audioInstalled).toBe(true);
      expect(createAudio).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PLACEHOLDER",
            isVerifiedNative: false,
          }),
        }),
      );
    } finally {
      cwdSpy.mockRestore();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
