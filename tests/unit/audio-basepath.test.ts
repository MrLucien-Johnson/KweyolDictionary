import { describe, expect, it } from "vitest";

function resolvePublicAssetPath(src: string, base: string) {
  if (src.startsWith("http") || src.startsWith("blob:") || src.startsWith("data:")) {
    return src;
  }
  if (!base || !src.startsWith("/") || src.startsWith(`${base}/`)) {
    return src;
  }
  return `${base}${src}`;
}

describe("audio public asset path", () => {
  it("prefixes GitHub Pages base path", () => {
    expect(resolvePublicAssetPath("/audio/bonjou.mp3", "/KweyolDictionary")).toBe(
      "/KweyolDictionary/audio/bonjou.mp3",
    );
  });

  it("leaves local and absolute URLs unchanged", () => {
    expect(resolvePublicAssetPath("/audio/bonjou.mp3", "")).toBe("/audio/bonjou.mp3");
    expect(
      resolvePublicAssetPath("https://example.com/a.mp3", "/KweyolDictionary"),
    ).toBe("https://example.com/a.mp3");
  });
});
