import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const backup = path.join(root, ".pages-backup");
const targets = [
  ["api", "src/app/api"],
  ["admin", "src/app/admin"],
];

for (const [name, toRel] of targets) {
  const from = path.join(backup, name);
  const to = path.join(root, toRel);
  if (!existsSync(from)) continue;
  if (existsSync(to)) {
    rmSync(to, { recursive: true, force: true });
  }
  renameSync(from, to);
  console.log(`Restored ${toRel}`);
}

if (existsSync(backup)) {
  rmSync(backup, { recursive: true, force: true });
}
