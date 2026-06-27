import { requireUser } from "@/lib/auth/require-user";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import "../app.css";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireUser();

  return (
    <div className="dashboard-shell">
      <div className="dashboard-ambient" aria-hidden="true" />
      <DashboardSidebar user={session} />
      <div className="dashboard-main">{children}</div>
    </div>
  );
}
