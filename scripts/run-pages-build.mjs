import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const env = {
  ...process.env,
  GITHUB_PAGES: "true",
  GITHUB_PAGES_REPO: process.env.GITHUB_PAGES_REPO ?? "KweyolDictionary",
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://mrlucien-johnson.github.io/KweyolDictionary",
  NEXT_PUBLIC_CONTRIBUTE_ISSUES_URL:
    process.env.NEXT_PUBLIC_CONTRIBUTE_ISSUES_URL ??
    "https://github.com/MrLucien-Johnson/KweyolDictionary/issues/new",
};

const build = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

const restore = spawnSync("node", ["scripts/restore-pages-build.mjs"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (restore.status !== 0) {
  process.exit(restore.status ?? 1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (!existsSync("out")) {
  console.error("Expected static export directory `out/` was not created.");
  process.exit(1);
}

console.log("GitHub Pages static export ready in out/");
