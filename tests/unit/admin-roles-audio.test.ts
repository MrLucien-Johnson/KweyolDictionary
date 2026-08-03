import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { installCommunityAudio } from "@/lib/audio/install-community-audio";
import {
  canAcceptTextSubmissions,
  canApproveEntries,
  canEditEntries,
  canReviewAudio,
  isUserRole,
} from "@/lib/constants/roles";
import {
  createAdminSessionToken,
  resolveAdminRole,
  validateAdminCredentials,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

describe("role permissions", () => {
  it("recognizes role strings", () => {
    expect(isUserRole("EDITOR")).toBe(true);
    expect(isUserRole("SUPERUSER")).toBe(false);
  });

  it("limits approval and audio review", () => {
    expect(canApproveEntries("LANGUAGE_REVIEWER")).toBe(true);
    expect(canApproveEntries("EDITOR")).toBe(false);
    expect(canApproveEntries("AUDIO_REVIEWER")).toBe(false);
    expect(canReviewAudio("AUDIO_REVIEWER")).toBe(true);
    expect(canReviewAudio("CONTRIBUTOR")).toBe(false);
    expect(canEditEntries("EDITOR")).toBe(true);
    expect(canAcceptTextSubmissions("EDITOR")).toBe(true);
    expect(canAcceptTextSubmissions("IMAGE_EDITOR")).toBe(false);
  });
});

describe("admin credentials and session role", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("defaults single admin to ADMINISTRATOR", () => {
    delete process.env.ADMIN_USERS_JSON;
    process.env.ADMIN_EMAIL = "editor@example.com";
    process.env.ADMIN_PASSWORD = "changeme";
    delete process.env.ADMIN_ROLE;
    const identity = validateAdminCredentials("editor@example.com", "changeme");
    expect(identity?.role).toBe("ADMINISTRATOR");
    expect(resolveAdminRole("editor@example.com")).toBe("ADMINISTRATOR");
  });

  it("honours ADMIN_ROLE for the single admin", () => {
    delete process.env.ADMIN_USERS_JSON;
    process.env.ADMIN_EMAIL = "editor@example.com";
    process.env.ADMIN_PASSWORD = "changeme";
    process.env.ADMIN_ROLE = "EDITOR";
    const identity = validateAdminCredentials("editor@example.com", "changeme");
    expect(identity?.role).toBe("EDITOR");
  });

  it("resolves roles from ADMIN_USERS_JSON", () => {
    process.env.ADMIN_USERS_JSON = JSON.stringify([
      {
        email: "reviewer@example.com",
        password: "secret",
        role: "LANGUAGE_REVIEWER",
      },
      {
        email: "audio@example.com",
        password: "secret",
        role: "AUDIO_REVIEWER",
      },
    ]);
    expect(
      validateAdminCredentials("reviewer@example.com", "secret")?.role,
    ).toBe("LANGUAGE_REVIEWER");
    expect(validateAdminCredentials("audio@example.com", "secret")?.role).toBe(
      "AUDIO_REVIEWER",
    );
    expect(validateAdminCredentials("audio@example.com", "wrong")).toBeNull();
  });

  it("round-trips role in the session token", () => {
    const token = createAdminSessionToken("a@b.co", "EDITOR");
    expect(verifyAdminSessionToken(token)).toEqual({
      email: "a@b.co",
      role: "EDITOR",
    });
  });
});

describe("installCommunityAudio", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("copies mp3 and removes the slug from the TTS manifest", () => {
    const root = mkdtempSync(path.join(tmpdir(), "kweyol-audio-"));
    dirs.push(root);
    const audioDir = path.join(root, "public", "audio");
    mkdirSync(audioDir, { recursive: true });
    writeFileSync(
      path.join(audioDir, "tts-manifest.json"),
      JSON.stringify({
        files: { bonjou: { voice: "x" }, other: { voice: "y" } },
        entryCount: 2,
      }),
    );
    const source = path.join(root, "recording.mp3");
    writeFileSync(source, "fake-mp3-bytes");

    const result = installCommunityAudio({
      slug: "bonjou",
      sourceFile: source,
      rootDir: root,
    });

    expect(result.removedFromTtsManifest).toBe(true);
    expect(readFileSync(result.targetPath, "utf8")).toBe("fake-mp3-bytes");
    const manifest = JSON.parse(
      readFileSync(path.join(audioDir, "tts-manifest.json"), "utf8"),
    ) as { files: Record<string, unknown>; entryCount: number };
    expect(manifest.files.bonjou).toBeUndefined();
    expect(manifest.files.other).toBeTruthy();
    expect(manifest.entryCount).toBe(1);
  });

  it("rejects invalid slugs", () => {
    const root = mkdtempSync(path.join(tmpdir(), "kweyol-audio-"));
    dirs.push(root);
    const source = path.join(root, "recording.mp3");
    writeFileSync(source, "x");
    expect(() =>
      installCommunityAudio({ slug: "../etc", sourceFile: source, rootDir: root }),
    ).toThrow(/Invalid audio slug/);
  });
});
