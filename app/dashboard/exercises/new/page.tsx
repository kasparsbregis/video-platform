import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExerciseUploadForm } from "@/components/exercises/exercise-upload-form";
import { hasBunnyStreamConfig } from "@/lib/bunny/config";
import Link from "next/link";

export default function NewExercisePage() {
  const configured = hasBunnyStreamConfig();

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

        <div className="panel" style={{ maxWidth: 560 }}>
          {configured ? (
            <div style={{ padding: "20px" }}>
              <ExerciseUploadForm />
            </div>
          ) : (
            <div className="empty-state">
              <h3>Bunny Stream not configured</h3>
              <p>
                Add <code>BUNNY_STREAM_LIBRARY_ID</code>,{" "}
                <code>BUNNY_STREAM_API_KEY</code>, and{" "}
                <code>BUNNY_STREAM_HOSTNAME</code> to your environment variables.
              </p>
              <Link href="/dashboard/exercises" className="app-btn app-btn-outline">
                Back to exercises
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
