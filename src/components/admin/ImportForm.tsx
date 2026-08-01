"use client";

import { FormEvent, useState } from "react";

export function ImportForm() {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File)) return;
    const text = await file.text();
    const response = await fetch("/api/admin/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: text,
    });
    const data = (await response.json()) as { imported?: number; error?: string };
    setMessage(
      response.ok
        ? `Imported ${data.imported ?? 0} entries.`
        : data.error ?? "Import failed",
    );
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <label>
        Dictionary JSON file
        <input name="file" type="file" accept="application/json,.json" required />
      </label>
      <button type="submit" className="btn btn--soft btn--md">
        Import entries
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}
