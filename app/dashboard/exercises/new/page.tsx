import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExerciseUploadForm } from "@/components/exercises/exercise-upload-form";
import { hasBunnyStreamConfig } from "@/lib/bunny/config";

const UPLOAD_TIPS = [
  "Record 3–5 full repetitions at a natural tempo.",
  "Keep the full body in frame with even lighting.",
  "Landscape orientation works best for PDF thumbnails.",
  "After upload you can add audio, text, and up to 4 thumbnail frames.",
];

export default function NewExercisePage() {
  const configured = hasBunnyStreamConfig();

  return (
    <>
      <DashboardHeader
        title="Upload exercise"
        subtitle="Add a demonstration video to your library — details and thumbnails come next."
      />
      <div className="dashboard-content dashboard-content--workspace">
        <div className="workspace-split workspace-split--upload">
          <aside className="workspace-aside panel">
            <div className="workspace-aside-inner">
              <h2 className="workspace-aside-title">Recording checklist</h2>
              <p className="workspace-aside-lead">
                Short, clear demos help patients follow programs at home.
              </p>
              <ol className="workspace-checklist">
                {UPLOAD_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ol>
              <div className="workspace-aside-note">
                <strong>Supported formats</strong>
                <span>MP4, MOV, WebM · up to 500 MB</span>
              </div>
            </div>
          </aside>

          <div className="workspace-main panel">
            {configured ? (
              <div className="workspace-main-inner">
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
      </div>
    </>
  );
}
