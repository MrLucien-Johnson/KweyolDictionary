"use client";

import { FormEvent, useState } from "react";

type ContributeFormProps = {
  defaultEntry?: string;
  defaultType?: string;
};

export function ContributeForm({
  defaultEntry,
  defaultType,
}: ContributeFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.get("type"),
        submitterEmail: form.get("email") || undefined,
        submitterNote: form.get("note"),
        payload: {
          entrySlug: form.get("entrySlug"),
          kweyolWord: form.get("kweyolWord"),
          englishTranslation: form.get("englishTranslation"),
          details: form.get("details"),
        },
      }),
    });
    if (!response.ok) {
      setError("Could not send your suggestion. Please try again.");
      return;
    }
    setMessage("Thank you. Your suggestion was received and awaits moderation.");
    event.currentTarget.reset();
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <label>
        Suggestion type
        <select name="type" defaultValue={defaultType ?? "NEW_WORD"} required>
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
      <label>
        Your email (optional)
        <input name="email" type="email" />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p role="status">{message}</p> : null}
      <button type="submit" className="btn btn--primary btn--md">
        Submit for review
      </button>
    </form>
  );
}
