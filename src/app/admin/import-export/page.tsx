import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportButton } from "@/components/admin/ExportButton";
import { ImportForm } from "@/components/admin/ImportForm";
import { getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Import / export",
  robots: { index: false, follow: false },
};

export default async function ImportExportPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="admin-page">
      <h1>Import and export</h1>
      <p>
        Export approved and draft entries as JSON. Imports create or update by
        slug and default new rows to DRAFT unless a review status is supplied.
      </p>
      <ExportButton />
      <ImportForm />
      <Link href="/admin" className="btn btn--soft btn--md">
        Back to dashboard
      </Link>
    </div>
  );
}
