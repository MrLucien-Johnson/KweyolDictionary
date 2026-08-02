import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmissionActions } from "@/components/admin/SubmissionActions";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Submissions",
  robots: { index: false, follow: false },
};

export default async function AdminSubmissionsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const submissions = await prisma.communitySubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="admin-page">
      <h1>Community submissions</h1>
      <p>All suggestions require moderation before publication.</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Note</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.type}</td>
                <td>{submission.status}</td>
                <td>{submission.submitterNote ?? "—"}</td>
                <td>{submission.createdAt.toISOString()}</td>
                <td>
                  {submission.status === "PENDING" ? (
                    <SubmissionActions id={submission.id} />
                  ) : (
                    "—"
                  )}
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
