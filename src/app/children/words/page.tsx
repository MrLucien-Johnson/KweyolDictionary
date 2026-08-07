import type { Metadata } from "next";
import { Suspense } from "react";
import { ChildrenWordsBrowser } from "@/components/children/ChildrenWordsBrowser";

export const metadata: Metadata = {
  title: "Children’s words",
  description: "Picture words from the children’s Dominican Kwéyòl dictionary.",
};

export default function ChildrenWordsPage() {
  return (
    <div className="children-page">
      <header className="dict-page__header">
        <h1>Picture words</h1>
        <p>
          Search or browse picture cards. Tap a card to learn more, and use
          Listen when audio is ready.
        </p>
      </header>
      <Suspense fallback={<p className="loading-line">Loading picture words…</p>}>
        <ChildrenWordsBrowser />
      </Suspense>
    </div>
  );
}
