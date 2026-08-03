#!/usr/bin/env node
/**
 * Install a reviewed community recording into the public audio set.
 *
 * Usage:
 *   npm run content:accept-audio -- --slug bonjou --file ./path/recording.webm
 *
 * Never marks audio as CONFIRMED native automatically.
 */
import { installCommunityAudio } from "../src/lib/audio/install-community-audio";

function arg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

const slug = arg("--slug");
const file = arg("--file");

if (!slug || !file) {
  console.error(
    "Usage: npm run content:accept-audio -- --slug <entry-slug> --file <recording>",
  );
  process.exit(1);
}

try {
  const result = installCommunityAudio({ slug, sourceFile: file });
  if (result.removedFromTtsManifest) {
    console.log(`Removed ${slug} from synthetic TTS manifest.`);
  }
  console.log(`Installed reviewed recording → ${result.targetPath}`);
  console.log("Next:");
  console.log("  1. Listen again to the installed MP3");
  console.log("  2. npm run content:publish");
  console.log("  3. Deploy / merge only after the meticulous review checklist passes");
  console.log("  4. Keep status PLACEHOLDER until a verifier confirms native quality");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
