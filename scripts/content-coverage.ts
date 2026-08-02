import { writeFileSync } from "node:fs";
import catalogJson from "../src/data/published/catalog.json";
import type { PublishedCatalog, PublishedEntry } from "../src/lib/content/types";

const catalog = catalogJson as PublishedCatalog;

function main() {
  const entries: PublishedEntry[] = catalog.entries;
  const approved = entries.filter((entry) => entry.reviewStatus === "APPROVED");
  const drafts = entries.filter((entry) => entry.reviewStatus === "DRAFT");
  const withAudio = entries.filter((entry) =>
    entry.audioFiles.some((file) => file.status !== "MISSING"),
  );
  const withSyntheticAudio = entries.filter((entry) =>
    entry.audioFiles.some((file) => file.source === "SYNTHETIC_TTS"),
  );
  const withRecordedAudio = entries.filter((entry) =>
    entry.audioFiles.some((file) => file.source === "RECORDED"),
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

  const allCategoryKeys = [
    ...catalog.adultCategories.map((category) => category.key),
    ...catalog.childCategories.map((category) => category.key),
  ];
  const thinCategories = [...new Set(allCategoryKeys)].filter(
    (key) =>
      !entries.some(
        (entry) =>
          entry.topicCategory === key || entry.categories.includes(key),
      ),
  );

  const report = `# Content coverage report

Generated: ${new Date().toISOString()}

Source: published static catalog (GitHub Pages / public dictionary)

| Metric | Count |
|--------|------:|
| Total entries | ${entries.length} |
| Approved entries | ${approved.length} |
| Draft entries | ${drafts.length} |
| Words with audio | ${withAudio.length} |
| Words with synthetic TTS audio | ${withSyntheticAudio.length} |
| Words with recorded (non-TTS) audio | ${withRecordedAudio.length} |
| Words without audio | ${entries.length - withAudio.length} |
| Words with images (incl. placeholders) | ${withImages.length} |
| Children’s words without confirmed images | ${childWithoutImages.length} |
| Entries without examples | ${withoutExamples.length} |
| Entries without cultural notes | ${withoutCultural.length} |
| Duplicate headword candidates | ${duplicates.length} |
| Categories with little or no content | ${thinCategories.length} |
| Grammar lessons | ${catalog.lessons.length} |
| Quizzes | ${catalog.quizzes.length} |
| Children’s activities | ${catalog.childActivities.length} |

## Notes

- Beginner product-density curriculum is approved for public learning journeys.
- Entries remain open to Dominican community and linguist correction.
- Synthetic TTS may be present as practice audio; it is not native Dominican Kwéyòl.
- Confirmed native recordings and final illustrations remain outstanding.

## Duplicate headword candidates

${duplicates.length ? duplicates.map(([word, count]) => `- ${word} (${count})`).join("\n") : "_None_"}

## Thin categories (sample)

${thinCategories.slice(0, 25).map((key) => `- ${key}`).join("\n") || "_None_"}
`;

  writeFileSync("docs/CONTENT_COVERAGE.md", report);
  console.log(report);
}

main();
