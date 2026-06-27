import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getSession } from "@/lib/auth/server";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <>
      <DashboardHeader title="Settings" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Settings</h1>
            <p>Account and workspace preferences.</p>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 480 }}>
          <div style={{ padding: "20px" }}>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <span className="form-label">Name</span>
              <span style={{ fontSize: "0.9375rem" }}>{session?.name}</span>
            </div>
            <div className="form-field">
              <span className="form-label">Email</span>
              <span style={{ fontSize: "0.9375rem" }}>{session?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
