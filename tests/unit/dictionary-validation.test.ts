import { describe, expect, it } from "vitest";
import {
  assertPublicEntryVisibility,
  dictionaryEntryInputSchema,
} from "@/lib/validation/dictionary-entry";
import { isPubliclyVisibleStatus } from "@/lib/constants/review-status";
import { canApproveEntries } from "@/lib/constants/roles";
import { buildImageFileName } from "@/lib/constants/categories";

describe("dictionaryEntryInputSchema", () => {
  it("accepts a valid draft entry", () => {
    const parsed = dictionaryEntryInputSchema.parse({
      slug: "bonjou-demo",
      kweyolWord: "bonjou",
      englishTranslation: "good morning",
      reviewStatus: "DRAFT",
    });
    expect(parsed.reviewStatus).toBe("DRAFT");
    expect(parsed.formalityLevel).toBe("NEUTRAL");
  });

  it("rejects invalid slugs", () => {
    const result = dictionaryEntryInputSchema.safeParse({
      slug: "Bad Slug",
      kweyolWord: "bonjou",
      englishTranslation: "good morning",
    });
    expect(result.success).toBe(false);
  });
});

describe("public visibility rules", () => {
  it("only APPROVED entries are public by default", () => {
    expect(assertPublicEntryVisibility("APPROVED")).toBe(true);
    expect(assertPublicEntryVisibility("DRAFT")).toBe(false);
    expect(isPubliclyVisibleStatus("NEEDS_REVIEW")).toBe(false);
  });
});

describe("roles", () => {
  it("limits approval to designated roles", () => {
    expect(canApproveEntries("LANGUAGE_REVIEWER")).toBe(true);
    expect(canApproveEntries("CONTRIBUTOR")).toBe(false);
    expect(canApproveEntries("EDITOR")).toBe(false);
  });
});

describe("image naming", () => {
  it("follows category-word-audience-id convention", () => {
    expect(
      buildImageFileName({
        categoryKey: "animals",
        kweyolSlug: "chat",
        audienceTag: "kid",
        entryShortId: "0042",
      }),
    ).toBe("animals-chat-kid-0042.webp");
  });
});
