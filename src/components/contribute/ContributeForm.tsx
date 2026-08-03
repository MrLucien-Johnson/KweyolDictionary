"use client";

import { FormEvent, useEffect, useState } from "react";
import { CommunityAudioUploader } from "@/components/contribute/CommunityAudioUploader";

type ContributeFormProps = {
  defaultEntry?: string;
  defaultType?: string;
  defaultWord?: string;
  defaultEnglish?: string;
  issuesUrl: string;
};

export function ContributeForm({
  defaultEntry,
  defaultType = "NEW_WORD",
  defaultWord,
  defaultEnglish,
  issuesUrl,
}: ContributeFormProps) {
  const isAudio = defaultType === "AUDIO";
  const [localApiAvailable, setLocalApiAvailable] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    void fetch(`${base}/api/submissions`, { method: "GET" })
      .then((response) => {
        if (!cancelled) setLocalApiAvailable(response.ok);
      })
      .catch(() => {
        if (!cancelled) setLocalApiAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function buildIssueUrl(form: HTMLFormElement) {
    const data = new FormData(form);
    const title = encodeURIComponent(
      `[${String(data.get("type") ?? "NEW_WORD")}] ${String(data.get("kweyolWord") || data.get("entrySlug") || "suggestion")}`,
    );
    const body = encodeURIComponent(
      [
        `**Type:** ${String(data.get("type") ?? "")}`,
        `**Entry slug:** ${String(data.get("entrySlug") ?? "")}`,
        `**Kwéyòl word:** ${String(data.get("kweyolWord") ?? "")}`,
        `**English:** ${String(data.get("englishTranslation") ?? "")}`,
        "",
        "## Details",
        String(data.get("details") ?? ""),
        "",
        "## Note for editors",
        String(data.get("note") ?? ""),
        "",
        "_Submitted from the static GitHub Pages site. Requires moderation before publication._",
      ].join("\n"),
    );
    const separator = issuesUrl.includes("?") ? "&" : "?";
    return `${issuesUrl}${separator}title=${title}&body=${body}`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const type = String(data.get("type") ?? "");

    if (type === "AUDIO") {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const slug = String(data.get("entrySlug") ?? defaultEntry ?? "");
      window.location.href = `${base}/contribute?type=AUDIO&entry=${encodeURIComponent(slug)}`;
      return;
    }

    if (!localApiAvailable) {
      window.open(buildIssueUrl(form), "_blank", "noopener,noreferrer");
      return;
    }

    setSubmitting(true);
    setError(null);
    setStatus(null);
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const response = await fetch(`${base}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        submitterNote: String(data.get("note") ?? "") || undefined,
        payload: {
          entrySlug: String(data.get("entrySlug") ?? ""),
          kweyolWord: String(data.get("kweyolWord") ?? ""),
          englishTranslation: String(data.get("englishTranslation") ?? ""),
          details: String(data.get("details") ?? ""),
        },
      }),
    });
    setSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(body?.error ?? "Could not queue submission");
      return;
    }
    form.reset();
    setStatus(
      "Queued for local moderation. Editors can accept it under /admin/submissions (creates a draft, not public).",
    );
  }

  return (
    <div className="contribute-stack">
      {isAudio ? (
        <CommunityAudioUploader
          issuesUrl={issuesUrl}
          defaultEntry={defaultEntry}
          defaultWord={defaultWord}
          defaultEnglish={defaultEnglish}
        />
      ) : null}

      <form className="admin-form" onSubmit={(event) => void onSubmit(event)}>
        <h2 className="section-title">
          {isAudio ? "Other contribution types" : "Suggest a contribution"}
        </h2>
        <p className="section-lead">
          {localApiAvailable
            ? "Local API detected: text suggestions queue for admin moderation and become drafts when accepted."
            : "On GitHub Pages, text suggestions open a GitHub Issue for moderation."}{" "}
          Audio uses a stricter pre-verification flow. No personal child data is
          collected.
        </p>
        <label>
          Suggestion type
          <select name="type" defaultValue={isAudio ? "NEW_WORD" : defaultType} required>
            <option value="NEW_WORD">New word</option>
            <option value="CORRECTION">Correction</option>
            <option value="AUDIO">Audio (opens verified-speech flow)</option>
            <option value="EXAMPLE">Example sentence</option>
            <option value="CULTURAL_NOTE">Cultural explanation</option>
            <option value="ALTERNATIVE_SPELLING">Alternative spelling</option>
          </select>
        </label>
        <label>
          Related entry slug (optional)
          <input name="entrySlug" defaultValue={defaultEntry ?? ""} />
        </label>
        <label>
          Kwéyòl word
          <input name="kweyolWord" defaultValue={defaultWord ?? ""} />
        </label>
        <label>
          English translation
          <input name="englishTranslation" defaultValue={defaultEnglish ?? ""} />
        </label>
        <label>
          Details
          <textarea name="details" rows={5} required={!isAudio} />
        </label>
        <label>
          Note for editors
          <textarea name="note" rows={3} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {status ? <p className="section-lead">{status}</p> : null}
        <button type="submit" className="btn btn--primary btn--md" disabled={submitting}>
          {submitting
            ? "Submitting…"
            : localApiAvailable
              ? "Submit for review"
              : "Continue"}
        </button>
      </form>
    </div>
  );
}
