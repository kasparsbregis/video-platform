import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function NewExercisePage() {
  return (
    <>
      <DashboardHeader title="Upload exercise" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Upload exercise</h1>
            <p>Record 3–5 repetitions and attach descriptions and thumbnails.</p>
          </div>
        </div>

        <div className="panel">
          <div className="empty-state">
            <h3>Upload flow coming soon</h3>
            <p>
              This page will support video upload, audio recording, text instructions,
              and thumbnail frame selection.
            </p>
            <Link href="/dashboard/exercises" className="app-btn app-btn-outline">
              Back to exercises
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
