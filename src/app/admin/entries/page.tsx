import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { REVIEW_STATUS_LABELS } from "@/lib/constants/review-status";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Manage entries",
  robots: { index: false, follow: false },
};

export default async function AdminEntriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const entries = await prisma.dictionaryEntry.findMany({
    orderBy: [{ reviewStatus: "asc" }, { kweyolWord: "asc" }],
    include: { childPresentation: true, adultPresentation: true },
  });

  return (
    <div className="admin-page">
      <header className="dict-page__header">
        <h1>Dictionary entries</h1>
        <p>
          Unverified entries are marked clearly. Public users only see approved
          words.
        </p>
        <Link href="/admin/entries/new" className="btn btn--primary btn--md">
          Add word
        </Link>
      </header>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kwéyòl</th>
              <th>English</th>
              <th>Status</th>
              <th>Child content</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.kweyolWord}</td>
                <td>{entry.englishTranslation}</td>
                <td>
                  <span
                    className={
                      entry.reviewStatus === "APPROVED"
                        ? "status-ok"
                        : "status-warn"
                    }
                  >
                    {REVIEW_STATUS_LABELS[entry.reviewStatus]}
                  </span>
                </td>
                <td>{entry.childPresentation ? "Yes" : "No"}</td>
                <td>
                  <Link href={`/admin/entries/${entry.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/admin" className="btn btn--soft btn--md">
        Back to dashboard
      </Link>
    </div>
  );
}
