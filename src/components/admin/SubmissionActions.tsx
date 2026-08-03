"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubmissionActionsProps = {
  id: string;
  type: string;
  canAccept: boolean;
};

export function SubmissionActions({
  id,
  type,
  canAccept,
}: SubmissionActionsProps) {
  const router = useRouter();
  const [listenedConfirmed, setListenedConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function moderate(action: "ACCEPT" | "REJECT") {
    setBusy(true);
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        ...(type === "AUDIO" ? { listenedConfirmed } : {}),
      }),
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
      apply?: { message?: string; entryId?: string };
    } | null;
    setBusy(false);
    if (!response.ok) {
      setError(data?.error ?? "Moderation failed");
      return;
    }
    if (data?.apply?.message) {
      setMessage(data.apply.message);
    }
    router.refresh();
  }

  if (!canAccept) {
    return <span className="muted">No accept permission</span>;
  }

  return (
    <span className="admin-inline-actions">
      {type === "AUDIO" ? (
        <label className="admin-listen-confirm">
          <input
            type="checkbox"
            checked={listenedConfirmed}
            onChange={(event) => setListenedConfirmed(event.target.checked)}
          />{" "}
          Listened
        </label>
      ) : null}
      <button
        type="button"
        className="text-link"
        disabled={busy || (type === "AUDIO" && !listenedConfirmed)}
        onClick={() => void moderate("ACCEPT")}
      >
        Accept
      </button>
      {" · "}
      <button
        type="button"
        className="text-link"
        disabled={busy}
        onClick={() => void moderate("REJECT")}
      >
        Reject
      </button>
      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="section-lead">{message}</p> : null}
    </span>
  );
}
