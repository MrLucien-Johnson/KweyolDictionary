import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

async function main() {
  const entries = await prisma.dictionaryEntry.findMany({
    include: {
      examples: true,
      audioFiles: true,
      imageAssets: true,
      childPresentation: true,
    },
  });

  const approved = entries.filter((entry) => entry.reviewStatus === "APPROVED");
  const drafts = entries.filter((entry) => entry.reviewStatus === "DRAFT");
  const withAudio = entries.filter((entry) =>
    entry.audioFiles.some((file) => file.status !== "MISSING"),
  );
  const withImages = entries.filter((entry) => entry.imageAssets.length > 0);
  const childWithoutImages = entries.filter(
    (entry) =>
      entry.childPresentation &&
      !entry.imageAssets.some((image) => image.status === "CONFIRMED"),
  );
  const withoutExamples = entries.filter((entry) => entry.examples.length === 0);
  const withoutCultural = entries.filter(
    (entry) => !entry.culturalNotes || !entry.culturalNotes.trim(),
  );

  const slugCounts = new Map<string, number>();
  for (const entry of entries) {
    const key = entry.kweyolWord.toLowerCase();
    slugCounts.set(key, (slugCounts.get(key) ?? 0) + 1);
  }
  const duplicates = [...slugCounts.entries()].filter(([, count]) => count > 1);

  const categories = await prisma.category.findMany({
    include: { entries: true },
  });
  const thinCategories = categories.filter((category) => category.entries.length === 0);

  const report = `# Content coverage report

Generated: ${new Date().toISOString()}

| Metric | Count |
|--------|------:|
| Total entries | ${entries.length} |
| Approved entries | ${approved.length} |
| Draft entries | ${drafts.length} |
| Words with audio | ${withAudio.length} |
| Words without audio | ${entries.length - withAudio.length} |
| Words with images | ${withImages.length} |
| Children’s words without confirmed images | ${childWithoutImages.length} |
| Entries without examples | ${withoutExamples.length} |
| Entries without cultural notes | ${withoutCultural.length} |
| Duplicate candidates | ${duplicates.length} |
| Categories with little or no content | ${thinCategories.length} |

## Duplicate candidates

${duplicates.length ? duplicates.map(([word, count]) => `- ${word} (${count})`).join("\n") : "_None_"}

## Thin categories (sample)

${thinCategories
  .slice(0, 20)
  .map((category) => `- ${category.key}`)
  .join("\n") || "_None_"}
`;

  writeFileSync("docs/CONTENT_COVERAGE.md", report);
  console.log(report);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
