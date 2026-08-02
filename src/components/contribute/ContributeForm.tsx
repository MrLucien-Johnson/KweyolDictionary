"use client";

type ContributeFormProps = {
  defaultEntry?: string;
  defaultType?: string;
  issuesUrl: string;
};

export function ContributeForm({
  defaultEntry,
  defaultType = "NEW_WORD",
  issuesUrl,
}: ContributeFormProps) {
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
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        window.open(buildIssueUrl(event.currentTarget), "_blank", "noopener,noreferrer");
      }}
    >
      <p className="section-lead">
        On GitHub Pages, suggestions open a GitHub Issue for moderation. No
        personal child data is collected.
      </p>
      <label>
        Suggestion type
        <select name="type" defaultValue={defaultType} required>
          <option value="NEW_WORD">New word</option>
          <option value="CORRECTION">Correction</option>
          <option value="AUDIO">Audio</option>
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
        <input name="kweyolWord" />
      </label>
      <label>
        English translation
        <input name="englishTranslation" />
      </label>
      <label>
        Details
        <textarea name="details" rows={5} required />
      </label>
      <label>
        Note for editors
        <textarea name="note" rows={3} />
      </label>
      <button type="submit" className="btn btn--primary btn--md">
        Open GitHub suggestion
      </button>
    </form>
  );
}
