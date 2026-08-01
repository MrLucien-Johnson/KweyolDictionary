import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Children’s Dictionary",
  description:
    "A child-friendly Dominican Kwéyòl learning dictionary with illustrations and audio.",
};

export default function ChildrenDictionaryPage() {
  return (
    <div className="placeholder-page">
      <h1>Children’s Dictionary</h1>
      <p>
        Illustrated categories, listen buttons and age-banded word cards are
        planned for Phase 5. No personal information is required for children
        to explore.
      </p>
      <span className="status-chip">Phase 2 foundation · Phase 5 next</span>
      <div style={{ marginTop: "1.5rem" }}>
        <ButtonLink href="/" variant="soft">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
