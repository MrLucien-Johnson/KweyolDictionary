import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminSession } from "@/lib/admin/auth";
import { REVIEW_STATUS_LABELS } from "@/lib/constants/review-status";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [entries, missingAudio, missingImages, submissions, byStatus] =
    await Promise.all([
      prisma.dictionaryEntry.count(),
      prisma.dictionaryEntry.count({
        where: {
          audioFiles: { none: { status: { in: ["CONFIRMED", "PLACEHOLDER"] } } },
        },
      }),
      prisma.childPresentation.count({
        where: {
          entry: { imageAssets: { none: { status: "CONFIRMED" } } },
        },
      }),
      prisma.communitySubmission.count({ where: { status: "PENDING" } }),
      prisma.dictionaryEntry.groupBy({
        by: ["reviewStatus"],
        _count: { _all: true },
      }),
    ]);

  return (
    <div className="admin-page">
      <header className="dict-page__header">
        <h1>Administration</h1>
        <p>Signed in as {session.email}</p>
      </header>

      <div className="feature-grid">
        <article className="feature-block">
          <h3>Entries</h3>
          <p>{entries} total dictionary entries</p>
          <Link href="/admin/entries" className="btn btn--soft btn--md">
            Manage entries
          </Link>
        </article>
        <article className="feature-block">
          <h3>Missing media</h3>
          <p>
            {missingAudio} without audio · {missingImages} children’s
            presentations without confirmed images
          </p>
          <Link href="/admin/media" className="btn btn--soft btn--md">
            Media reports
          </Link>
        </article>
        <article className="feature-block">
          <h3>Submissions</h3>
          <p>{submissions} pending community submissions</p>
          <Link href="/admin/submissions" className="btn btn--soft btn--md">
            Review submissions
          </Link>
        </article>
        <article className="feature-block">
          <h3>Import / export</h3>
          <p>Download or replace dictionary JSON for editorial workflows.</p>
          <Link href="/admin/import-export" className="btn btn--soft btn--md">
            Open tools
          </Link>
        </article>
      </div>

      <section className="learn-section">
        <h2 className="section-title">Review status breakdown</h2>
        <ul className="plain-list">
          {byStatus.map((row) => (
            <li key={row.reviewStatus}>
              {REVIEW_STATUS_LABELS[row.reviewStatus]}: {row._count._all}
            </li>
          ))}
        </ul>
      </section>

      <LogoutButton />
    </div>
  );
}
