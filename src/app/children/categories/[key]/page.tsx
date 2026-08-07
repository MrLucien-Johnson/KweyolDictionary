import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChildrenWordsBrowser } from "@/components/children/ChildrenWordsBrowser";
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
        <p>Search this category or tap a picture card to learn the Kwéyòl word.</p>
      </header>
      {words.length ? (
        <Suspense fallback={<p className="loading-line">Loading words…</p>}>
          <ChildrenWordsBrowser
            categoryKey={key}
            categoryName={category.nameEn}
          />
        </Suspense>
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
