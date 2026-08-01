import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Grammar & learning",
  description:
    "Adult grammar lessons and practice for Dominican Kwéyòl.",
};

export default function LearnPage() {
  return (
    <div className="placeholder-page">
      <h1>Grammar & learning</h1>
      <p>
        Alphabet, pronunciation, sentence patterns, flashcards and quizzes will
        be added in Phase 4. Quiz answers will stay inside the quiz experience
        only.
      </p>
      <span className="status-chip">Phase 2 foundation · Phase 4 next</span>
      <div style={{ marginTop: "1.5rem" }}>
        <ButtonLink href="/" variant="soft">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
