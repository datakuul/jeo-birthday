import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted lg:flex-row">
      <AdminSidebar email={session.user.email} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
