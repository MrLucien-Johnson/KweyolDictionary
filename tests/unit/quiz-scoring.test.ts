import { describe, expect, it } from "vitest";
import { assertPublicEntryVisibility } from "@/lib/validation/dictionary-entry";

describe("quiz answer privacy contract", () => {
  it("keeps unapproved content out of public dictionary visibility helper", () => {
    expect(assertPublicEntryVisibility("DRAFT")).toBe(false);
    expect(assertPublicEntryVisibility("APPROVED")).toBe(true);
  });
});
