import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChildWordCard } from "@/components/children/ChildWordCard";
import { listChildCategories, listChildWords } from "@/lib/children/queries";

type Props = { params: Promise<{ key: string }> };

export async function generateStaticParams() {
  const categories = await listChildCategories();
  return categories.map((category) => ({ key: category.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const categories = await listChildCategories();
  const category = categories.find((item) => item.key === key);
  return { title: category ? `${category.nameEn} for children` : "Category" };
}

export default async function ChildCategoryPage({ params }: Props) {
  const { key } = await params;
  const categories = await listChildCategories();
  const category = categories.find((item) => item.key === key);
  if (!category) notFound();
  const words = await listChildWords({ category: key });

  return (
    <div className="children-page">
      <header className="dict-page__header">
        <h1>{category.nameEn}</h1>
        <p>Tap a picture card to learn the Kwéyòl word.</p>
      </header>
      {words.length ? (
        <div className="child-word-grid">
          {words.map((word) => {
            const image = word.imageAssets[0];
            const audio = word.audioFiles.find((file) => file.status !== "MISSING");
            return (
              <ChildWordCard
                key={word.id}
                slug={word.slug}
                kweyolWord={word.kweyolWord}
                meaning={
                  word.childPresentation?.simpleMeaning ?? word.englishTranslation
                }
                imageSrc={image?.filePath}
                imageStatus={image?.status}
                audioSrc={audio?.filePath}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No approved words in this category yet</h2>
          <p>Check another category while more children’s words are reviewed.</p>
          <Link href="/children" className="btn btn--soft btn--md">
            All categories
          </Link>
        </div>
      )}
    </div>
  );
}
