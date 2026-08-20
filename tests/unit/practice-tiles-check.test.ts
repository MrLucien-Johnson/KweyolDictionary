import { describe, expect, it } from "vitest";
import { joinTokens } from "@/lib/practice/sentence";

describe("tile check UX contract", () => {
  it("treats joined tokens as the grading key", () => {
    const correct = ["Bonjou", ",", "tout", "moun", "."];
    const wrong = ["tout", "Bonjou", ",", "moun", "."];
    expect(joinTokens(correct)).not.toBe(joinTokens(wrong));
    expect(joinTokens(correct)).toBe("Bonjou, tout moun.");
  });
});
