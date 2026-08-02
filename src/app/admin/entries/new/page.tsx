import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EntryEditorForm } from "@/components/admin/EntryEditorForm";
import { getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Add entry",
  robots: { index: false, follow: false },
};

export default async function NewEntryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <div className="admin-page">
      <h1>Add dictionary entry</h1>
      <EntryEditorForm />
    </div>
  );
}
