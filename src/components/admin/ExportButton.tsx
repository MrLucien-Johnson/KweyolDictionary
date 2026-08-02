"use client";

export function ExportButton() {
  return (
    <a className="btn btn--primary btn--md" href="/api/admin/export">
      Download dictionary JSON
    </a>
  );
}
