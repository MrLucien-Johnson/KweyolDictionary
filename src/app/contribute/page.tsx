import type { Metadata } from "next";
import { Suspense } from "react";
import { ContributeFormClient } from "@/components/contribute/ContributeFormClient";
import { LANGUAGE_VARIATION_NOTE } from "@/lib/content/editorial";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Suggest Dominican Kwéyòl words, corrections, audio and cultural notes for review.",
};

export default function ContributePage() {
  const issuesUrl =
    process.env.NEXT_PUBLIC_CONTRIBUTE_ISSUES_URL ??
    "https://github.com/MrLucien-Johnson/KweyolDictionary/issues/new";

  return (
    <div className="placeholder-page">
      <h1>Contribute</h1>
      <p>
        Suggest new words, corrections, example sentences, cultural explanations
        or alternative spellings. Every submission is moderated before
        publication.
      </p>
      <p>{LANGUAGE_VARIATION_NOTE}</p>
      <Suspense fallback={<p className="loading-line">Loading form…</p>}>
        <ContributeFormClient issuesUrl={issuesUrl} />
      </Suspense>
    </div>
  );
}
