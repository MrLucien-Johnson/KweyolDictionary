import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LANGUAGE_VARIATION_NOTE } from "@/lib/content/editorial";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Suggest Dominican Kwéyòl words, corrections, audio and cultural notes for review.",
};

export default function ContributePage() {
  return (
    <div className="placeholder-page">
      <h1>Contribute</h1>
      <p>
        Community suggestions for new words, corrections, audio, examples and
        cultural explanations will be collected here. Every submission requires
        moderation before publication.
      </p>
      <p>{LANGUAGE_VARIATION_NOTE}</p>
      <span className="status-chip">Moderation workflow · Phase 7</span>
      <div style={{ marginTop: "1.5rem" }}>
        <ButtonLink href="/" variant="soft">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
