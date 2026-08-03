import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export type InstallCommunityAudioInput = {
  slug: string;
  /** Absolute or cwd-relative path to the reviewed recording. */
  sourceFile: string;
  rootDir?: string;
};

export type InstallCommunityAudioResult = {
  targetPath: string;
  removedFromTtsManifest: boolean;
};

/**
 * Install a reviewed community recording into public/audio/{slug}.mp3
 * and remove the slug from the synthetic TTS manifest.
 * Never marks audio as CONFIRMED native.
 */
export function installCommunityAudio(
  input: InstallCommunityAudioInput,
): InstallCommunityAudioResult {
  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid audio slug: ${input.slug}`);
  }

  const root = input.rootDir ?? process.cwd();
  const sourceFile = path.isAbsolute(input.sourceFile)
    ? input.sourceFile
    : path.join(root, input.sourceFile);

  if (!existsSync(sourceFile)) {
    throw new Error(`File not found: ${sourceFile}`);
  }

  const audioDir = path.join(root, "public", "audio");
  const targetPath = path.join(audioDir, `${slug}.mp3`);
  const manifestPath = path.join(audioDir, "tts-manifest.json");
  mkdirSync(audioDir, { recursive: true });

  const ext = path.extname(sourceFile).toLowerCase();
  if (ext === ".mp3") {
    copyFileSync(sourceFile, targetPath);
  } else {
    try {
      execFileSync(
        "ffmpeg",
        [
          "-y",
          "-i",
          sourceFile,
          "-vn",
          "-ar",
          "44100",
          "-ac",
          "1",
          "-b:a",
          "96k",
          targetPath,
        ],
        { stdio: "pipe" },
      );
    } catch {
      throw new Error(
        "ffmpeg conversion failed. Install ffmpeg or provide an .mp3 file.",
      );
    }
  }

  let removedFromTtsManifest = false;
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      files?: Record<string, unknown>;
      entryCount?: number;
      lastAcceptedCommunitySlug?: string;
      lastAcceptedAt?: string;
    };
    if (manifest.files && manifest.files[slug]) {
      delete manifest.files[slug];
      manifest.entryCount = Object.keys(manifest.files).length;
      manifest.lastAcceptedCommunitySlug = slug;
      manifest.lastAcceptedAt = new Date().toISOString();
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      removedFromTtsManifest = true;
    }
  }

  return { targetPath, removedFromTtsManifest };
}
