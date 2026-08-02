"use client";

import { useRouter } from "next/navigation";

export function SubmissionActions({ id }: { id: string }) {
  const router = useRouter();

  async function moderate(action: "ACCEPT" | "REJECT") {
    await fetch(`/api/admin/submissions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  return (
    <span className="admin-inline-actions">
      <button type="button" className="text-link" onClick={() => void moderate("ACCEPT")}>
        Accept
      </button>
      {" · "}
      <button type="button" className="text-link" onClick={() => void moderate("REJECT")}>
        Reject
      </button>
    </span>
  );
}
