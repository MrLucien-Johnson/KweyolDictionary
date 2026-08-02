import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const backup = path.join(root, ".pages-backup");
const targets = [
  ["src/app/api", "api"],
  ["src/app/admin", "admin"],
];

if (existsSync(backup)) {
  rmSync(backup, { recursive: true, force: true });
}
mkdirSync(backup, { recursive: true });

for (const [fromRel, name] of targets) {
  const from = path.join(root, fromRel);
  if (!existsSync(from)) continue;
  renameSync(from, path.join(backup, name));
  console.log(`Moved ${fromRel} → .pages-backup/${name} for static export`);
}
