import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmissionActions } from "@/components/admin/SubmissionActions";
import { getAdminSession } from "@/lib/admin/auth";
import {
  canAcceptTextSubmissions,
  canReviewAudio,
} from "@/lib/constants/roles";
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

function audioListenSrcFor(type: string, id: string, payloadJson: string) {
  if (type !== "AUDIO") return null;
  try {
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    const relative = String(payload.storedRelativePath ?? "");
    if (!relative.startsWith("storage/community-audio/")) return null;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    return `${base}/api/admin/submissions/${id}/audio`;
  } catch {
    return null;
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
        Accepting a text suggestion creates or updates a dictionary entry as{" "}
        <strong>NEEDS_REVIEW</strong> (never public automatically). Accepting
        audio installs the file into <code>public/audio/</code> after you confirm
        you listened — then run <code>npm run content:publish</code>. See{" "}
        <code>docs/AUDIO_REVIEW.md</code>.
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
                  {submission.status === "PENDING" ||
                  submission.status === "IN_REVIEW" ? (
                    <SubmissionActions
                      id={submission.id}
                      type={submission.type}
                      audioListenSrc={audioListenSrcFor(
                        submission.type,
                        submission.id,
                        submission.payloadJson,
                      )}
                      canAccept={
                        submission.type === "AUDIO"
                          ? canReviewAudio(session.role)
                          : canAcceptTextSubmissions(session.role)
                      }
                    />
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
