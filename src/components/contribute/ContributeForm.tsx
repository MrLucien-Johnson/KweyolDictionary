"use client";

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

      <form
        className="admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          const type = String(new FormData(event.currentTarget).get("type") ?? "");
          if (type === "AUDIO") {
            const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
            const slug = String(
              new FormData(event.currentTarget).get("entrySlug") ??
                defaultEntry ??
                "",
            );
            window.location.href = `${base}/contribute?type=AUDIO&entry=${encodeURIComponent(slug)}`;
            return;
          }
          window.open(buildIssueUrl(event.currentTarget), "_blank", "noopener,noreferrer");
        }}
      >
        <h2 className="section-title">
          {isAudio ? "Other contribution types" : "Suggest a contribution"}
        </h2>
        <p className="section-lead">
          On GitHub Pages, text suggestions open a GitHub Issue for moderation. Audio
          uses a stricter pre-verification flow above. No personal child data is
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
        <button type="submit" className="btn btn--primary btn--md">
          Continue
        </button>
      </form>
    </div>
  );
}
