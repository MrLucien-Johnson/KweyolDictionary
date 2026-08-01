import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Media reports",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [noAudio, placeholderImages, missingImages] = await Promise.all([
    prisma.dictionaryEntry.findMany({
      where: {
        audioFiles: { none: {} },
      },
      select: { slug: true, kweyolWord: true, reviewStatus: true },
      orderBy: { kweyolWord: "asc" },
      take: 100,
    }),
    prisma.imageAsset.findMany({
      where: { status: "PLACEHOLDER" },
      include: { entry: true },
      take: 100,
    }),
    prisma.childPresentation.findMany({
      where: { entry: { imageAssets: { none: {} } } },
      include: { entry: true },
      take: 100,
    }),
  ]);

  return (
    <div className="admin-page">
      <h1>Missing media reports</h1>
      <section className="learn-section">
        <h2 className="section-title">Entries without audio ({noAudio.length})</h2>
        <ul className="plain-list">
          {noAudio.map((entry) => (
            <li key={entry.slug}>
              {entry.kweyolWord} · {entry.reviewStatus}
            </li>
          ))}
        </ul>
      </section>
      <section className="learn-section">
        <h2 className="section-title">
          Placeholder images ({placeholderImages.length})
        </h2>
        <ul className="plain-list">
          {placeholderImages.map((image) => (
            <li key={image.id}>
              {image.fileName} · {image.entry?.kweyolWord ?? "unlinked"}
            </li>
          ))}
        </ul>
      </section>
      <section className="learn-section">
        <h2 className="section-title">
          Child words missing images ({missingImages.length})
        </h2>
        <ul className="plain-list">
          {missingImages.map((row) => (
            <li key={row.id}>{row.entry.kweyolWord}</li>
          ))}
        </ul>
      </section>
      <Link href="/admin" className="btn btn--soft btn--md">
        Back to dashboard
      </Link>
    </div>
  );
}
