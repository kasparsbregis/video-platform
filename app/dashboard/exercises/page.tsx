import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { requireUser } from "@/lib/auth/require-user";
import { getExercisesForUser } from "@/lib/data/queries";

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
                  <th>Audio</th>
                  <th>Text</th>
                  <th>Thumbnails</th>
                  <th>Updated</th>
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
                    <td>{exercise.updatedAt}</td>
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
