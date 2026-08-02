#!/usr/bin/env node
/**
 * Install a reviewed community recording into the public audio set.
 *
 * Usage:
 *   node scripts/accept-community-audio.mjs --slug bonjou --file ./path/recording.webm
 *
 * Steps performed:
 * 1. Convert/copy into public/audio/{slug}.mp3 (ffmpeg when needed)
 * 2. Remove slug from public/audio/tts-manifest.json
 * 3. Remind maintainer to run content:publish and do a second listen
 *
 * Never marks audio as CONFIRMED native automatically.
 */
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

function arg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

const slug = arg("--slug");
const file = arg("--file");

if (!slug || !file) {
  console.error(
    "Usage: node scripts/accept-community-audio.mjs --slug <entry-slug> --file <recording>",
  );
  process.exit(1);
}

if (!existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

const root = process.cwd();
const audioDir = path.join(root, "public", "audio");
const target = path.join(audioDir, `${slug}.mp3`);
const manifestPath = path.join(audioDir, "tts-manifest.json");
mkdirSync(audioDir, { recursive: true });

const ext = path.extname(file).toLowerCase();
if (ext === ".mp3") {
  copyFileSync(file, target);
} else {
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-i", file, "-vn", "-ar", "44100", "-ac", "1", "-b:a", "96k", target],
      { stdio: "inherit" },
    );
  } catch {
    console.error("ffmpeg conversion failed. Install ffmpeg or provide an .mp3 file.");
    process.exit(1);
  }
}

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.files && manifest.files[slug]) {
    delete manifest.files[slug];
    manifest.entryCount = Object.keys(manifest.files).length;
    manifest.lastAcceptedCommunitySlug = slug;
    manifest.lastAcceptedAt = new Date().toISOString();
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Removed ${slug} from synthetic TTS manifest.`);
  }
}

console.log(`Installed reviewed recording → ${target}`);
console.log("Next:");
console.log("  1. Listen again to the installed MP3");
console.log("  2. npm run content:publish");
console.log("  3. Deploy / merge only after the meticulous review checklist passes");
console.log("  4. Keep status PLACEHOLDER until a verifier confirms native quality");
