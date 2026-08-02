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

function summarizePayload(type: string, payloadJson: string) {
  try {
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    if (type === "AUDIO") {
      return [
        `slug=${String(payload.entrySlug ?? "")}`,
        `word=${String(payload.kweyolWord ?? "")}`,
        `file=${String(payload.storedRelativePath ?? payload.originalFileName ?? "")}`,
        `duration=${String(payload.durationSeconds ?? "?")}s`,
        `state=${String(payload.reviewState ?? "PENDING")}`,
      ].join(" · ");
    }
    return JSON.stringify(payload).slice(0, 160);
  } catch {
    return payloadJson.slice(0, 160);
  }
}

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
      <p>
        All suggestions require moderation before publication. Audio submissions
        must be re-listened carefully and must not replace synthetic TTS until
        accepted via the audio review checklist (`docs/AUDIO_REVIEW.md`).
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Summary</th>
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
                <td>{summarizePayload(submission.type, submission.payloadJson)}</td>
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
