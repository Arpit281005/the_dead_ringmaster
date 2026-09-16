import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { verifyAdminSession, isAdminConfigured } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await verifyAdminSession()) redirect("/admin");

  return (
    <main className="flex-1 px-5 py-12 max-w-md mx-auto w-full">
      <h1 className="font-display text-2xl font-black mb-1">Organiser</h1>
      <p className="text-sm text-ink/60 mb-6">
        {isAdminConfigured()
          ? "Sign in to run the hunt."
          : "Set ADMIN_PASSWORD (8+ chars) in the environment."}
      </p>
      {isAdminConfigured() ? <AdminLoginForm /> : null}
    </main>
  );
}
