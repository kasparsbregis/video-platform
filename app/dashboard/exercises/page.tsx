import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExerciseDeleteButton } from "@/components/exercises/exercise-delete-button";
import { requireUser } from "@/lib/auth/require-user";
import { getExercisesForUser } from "@/lib/data/queries";

const statusLabels = {
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
} as const;

export default async function ExercisesPage() {
  const user = await requireUser();
  const exercises = await getExercisesForUser(user.id);

  return (
    <>
      <DashboardHeader title="Exercises" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Exercise library</h1>
            <p>Your uploaded demonstrations — video, audio, text, and thumbnails.</p>
          </div>
          <Link href="/dashboard/exercises/new" className="app-btn app-btn-primary">
            Upload exercise
          </Link>
        </div>

        <div className="panel">
          {exercises.length === 0 ? (
            <p style={{ padding: "20px", color: "var(--text-muted)" }}>
              No exercises yet. Upload your first demonstration to get started.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Video</th>
                  <th>Status</th>
                  <th>Audio</th>
                  <th>Text</th>
                  <th>Thumbnails</th>
                  <th>Programs</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>
                      <Link
                        href={`/dashboard/exercises/${exercise.id}`}
                        className="table-link"
                      >
                        {exercise.name}
                      </Link>
                    </td>
                    <td>{exercise.videoDuration}</td>
                    <td>
                      <span className={`badge badge-status badge-status--${exercise.status}`}>
                        {statusLabels[exercise.status]}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${exercise.hasAudio ? "badge-success" : "badge-muted"}`}>
                        {exercise.hasAudio ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${exercise.hasText ? "badge-success" : "badge-muted"}`}>
                        {exercise.hasText ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{exercise.thumbnails} / 4</td>
                    <td>
                      {exercise.programCount > 0 ? (
                        <span className="badge badge-muted">{exercise.programCount}</span>
                      ) : (
                        <span className="dash-table-muted">—</span>
                      )}
                    </td>
                    <td>{exercise.updatedAt}</td>
                    <td className="data-table-actions">
                      <ExerciseDeleteButton
                        exerciseId={exercise.id}
                        exerciseName={exercise.name}
                        programCount={exercise.programCount}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
