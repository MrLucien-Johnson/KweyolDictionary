import type { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { LANGUAGE_VARIATION_NOTE } from "@/lib/content/editorial";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Suggest Dominican Kwéyòl words, corrections, audio and cultural notes for review.",
};

type ContributePageProps = {
  searchParams: Promise<{ entry?: string; type?: string }>;
};

export default async function ContributePage({ searchParams }: ContributePageProps) {
  const params = await searchParams;
  return (
    <div className="placeholder-page">
      <h1>Contribute</h1>
      <p>
        Suggest new words, corrections, example sentences, cultural explanations
        or alternative spellings. Every submission is moderated before
        publication.
      </p>
      <p>{LANGUAGE_VARIATION_NOTE}</p>
      <ContributeForm
        defaultEntry={params.entry}
        defaultType={params.type}
      />
    </div>
  );
}
