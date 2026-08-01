import type { Metadata } from "next";
import { ChildWordCard } from "@/components/children/ChildWordCard";
import { listChildWords } from "@/lib/children/queries";

export const metadata: Metadata = {
  title: "Children’s words",
  description: "Picture words from the children’s Dominican Kwéyòl dictionary.",
};

export default async function ChildrenWordsPage() {
  const words = await listChildWords();

  return (
    <div className="children-page">
      <header className="dict-page__header">
        <h1>Picture words</h1>
        <p>Tap a card to learn more. Use Listen to hear the word when audio is ready.</p>
      </header>
      <div className="child-word-grid">
        {words.map((word) => {
          const image = word.imageAssets[0];
          const audio = word.audioFiles.find((file) => file.status !== "MISSING");
          return (
            <ChildWordCard
              key={word.id}
              slug={word.slug}
              kweyolWord={word.kweyolWord}
              meaning={word.childPresentation?.simpleMeaning ?? word.englishTranslation}
              imageSrc={image?.filePath}
              imageStatus={image?.status}
              audioSrc={audio?.filePath}
            />
          );
        })}
      </div>
    </div>
  );
}
