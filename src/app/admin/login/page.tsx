import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="admin-page">
      <h1>Editor sign in</h1>
      <p>
        Authorised editors can manage dictionary entries, media and community
        submissions. Use the credentials from your environment configuration.
      </p>
      <AdminLoginForm />
    </div>
  );
}
