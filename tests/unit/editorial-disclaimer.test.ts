import { describe, expect, it } from "vitest";
import {
  CONTENT_ACCURACY_DISCLAIMER,
  CONTENT_ACCURACY_SHORT,
  NO_PROFESSIONAL_ADVICE_NOTE,
  PROVISIONAL_CURRICULUM_BANNER,
} from "@/lib/content/editorial";

describe("public content disclaimer copy", () => {
  it("states provisional curriculum and as-is learning use", () => {
    expect(PROVISIONAL_CURRICULUM_BANNER.toLowerCase()).toContain("provisional");
    expect(CONTENT_ACCURACY_SHORT.toLowerCase()).toContain("as-is");
    expect(CONTENT_ACCURACY_DISCLAIMER.toLowerCase()).toContain("disclaim all warranties");
    expect(CONTENT_ACCURACY_DISCLAIMER.toLowerCase()).toContain("liability");
    expect(NO_PROFESSIONAL_ADVICE_NOTE.toLowerCase()).toContain("certified");
  });
});
