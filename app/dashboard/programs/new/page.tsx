import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function NewProgramPage() {
  return (
    <>
      <DashboardHeader title="New program" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Build a program</h1>
            <p>Select exercises, set the order, and prescribe sets and reps.</p>
          </div>
        </div>

        <div className="panel">
          <div className="empty-state">
            <h3>Program builder coming soon</h3>
            <p>
              This page will let you drag exercises into sequence, configure
              prescriptions per set, and generate a PDF on save.
            </p>
            <Link href="/dashboard/programs" className="app-btn app-btn-outline">
              Back to programs
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
