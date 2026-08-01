import { describe, expect, it } from "vitest";
import {
  normalizeSearchText,
  slugifyKweyol,
} from "@/lib/search/normalize";

describe("normalizeSearchText", () => {
  it("strips accents and apostrophes", () => {
    expect(normalizeSearchText("Kwéyòl")).toBe("kweyol");
    expect(normalizeSearchText("dlo’")).toBe("dlo");
    expect(normalizeSearchText("Bonjou")).toBe("bonjou");
  });

  it("collapses whitespace and lowercases", () => {
    expect(normalizeSearchText("  Bon  Jou  ")).toBe("bon jou");
  });
});

describe("slugifyKweyol", () => {
  it("creates kebab-case slugs", () => {
    expect(slugifyKweyol("Bon Jou")).toBe("bon-jou");
    expect(slugifyKweyol("Kwéyòl")).toBe("kweyol");
  });
});
