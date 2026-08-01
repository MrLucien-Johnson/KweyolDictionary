import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Adult Dictionary",
  description:
    "Browse and search the Dominican Kwéyòl–English adult dictionary.",
};

type DictionaryPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DictionaryPage({
  searchParams,
}: DictionaryPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  return (
    <div className="placeholder-page">
      <h1>Adult Dictionary</h1>
      <p>
        Search, alphabetical browsing, filters and full word pages arrive in
        Phase 3. The data model, review statuses and validation are ready now.
      </p>
      {query ? (
        <p>
          Your search for <strong>{query}</strong> will be handled by the adult
          dictionary search once Phase 3 is complete.
        </p>
      ) : null}
      <span className="status-chip">Phase 2 foundation · Phase 3 next</span>
      <div style={{ marginTop: "1.5rem" }}>
        <ButtonLink href="/" variant="soft">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
