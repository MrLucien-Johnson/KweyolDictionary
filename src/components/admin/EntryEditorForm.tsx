"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type EntryEditorFormProps = {
  entryId?: string;
  initial?: {
    slug: string;
    kweyolWord: string;
    englishTranslation: string;
    partOfSpeech?: string | null;
    pronunciationGuide?: string | null;
    simpleDefinition?: string | null;
    detailedDefinition?: string | null;
    culturalNotes?: string | null;
    topicCategory?: string | null;
    reviewStatus: string;
    childSimpleMeaning?: string | null;
  };
};

export function EntryEditorForm({ entryId, initial }: EntryEditorFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(
      entryId ? `/api/admin/entries/${entryId}` : "/api/admin/entries",
      {
        method: entryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setSaving(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? "Could not save entry");
      return;
    }
    router.push("/admin/entries");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <label>
        Slug
        <input name="slug" required defaultValue={initial?.slug} />
      </label>
      <label>
        Kwéyòl word
        <input name="kweyolWord" required defaultValue={initial?.kweyolWord} />
      </label>
      <label>
        English translation
        <input
          name="englishTranslation"
          required
          defaultValue={initial?.englishTranslation}
        />
      </label>
      <label>
        Part of speech
        <input name="partOfSpeech" defaultValue={initial?.partOfSpeech ?? ""} />
      </label>
      <label>
        Pronunciation
        <input
          name="pronunciationGuide"
          defaultValue={initial?.pronunciationGuide ?? ""}
        />
      </label>
      <label>
        Simple definition
        <textarea
          name="simpleDefinition"
          rows={3}
          defaultValue={initial?.simpleDefinition ?? ""}
        />
      </label>
      <label>
        Detailed definition
        <textarea
          name="detailedDefinition"
          rows={4}
          defaultValue={initial?.detailedDefinition ?? ""}
        />
      </label>
      <label>
        Cultural notes
        <textarea
          name="culturalNotes"
          rows={3}
          defaultValue={initial?.culturalNotes ?? ""}
        />
      </label>
      <label>
        Topic category key
        <input name="topicCategory" defaultValue={initial?.topicCategory ?? ""} />
      </label>
      <label>
        Review status
        <select name="reviewStatus" defaultValue={initial?.reviewStatus ?? "DRAFT"}>
          <option value="DRAFT">Draft</option>
          <option value="NEEDS_REVIEW">Needs review</option>
          <option value="LINGUIST_REVIEWED">Linguist reviewed</option>
          <option value="COMMUNITY_REVIEWED">Community reviewed</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </label>
      <label>
        Child-friendly meaning (optional)
        <input
          name="childSimpleMeaning"
          defaultValue={initial?.childSimpleMeaning ?? ""}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn--primary btn--md" disabled={saving}>
        {saving ? "Saving…" : "Save entry"}
      </button>
    </form>
  );
}
