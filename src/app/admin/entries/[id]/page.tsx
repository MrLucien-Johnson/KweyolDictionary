import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EntryEditorForm } from "@/components/admin/EntryEditorForm";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Edit entry",
  robots: { index: false, follow: false },
};

export default async function EditEntryPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const entry = await prisma.dictionaryEntry.findUnique({
    where: { id },
    include: { childPresentation: true, changeHistory: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!entry) notFound();

  return (
    <div className="admin-page">
      <h1>Edit {entry.kweyolWord}</h1>
      <EntryEditorForm
        entryId={entry.id}
        initial={{
          slug: entry.slug,
          kweyolWord: entry.kweyolWord,
          englishTranslation: entry.englishTranslation,
          partOfSpeech: entry.partOfSpeech,
          pronunciationGuide: entry.pronunciationGuide,
          simpleDefinition: entry.simpleDefinition,
          detailedDefinition: entry.detailedDefinition,
          culturalNotes: entry.culturalNotes,
          topicCategory: entry.topicCategory,
          reviewStatus: entry.reviewStatus,
          childSimpleMeaning: entry.childPresentation?.simpleMeaning,
        }}
      />
      <section className="learn-section">
        <h2 className="section-title">Recent change history</h2>
        <ul className="plain-list">
          {entry.changeHistory.map((event) => (
            <li key={event.id}>
              {event.action} · {event.createdAt.toISOString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
