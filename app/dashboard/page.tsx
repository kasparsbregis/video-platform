import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import {
  DashboardTopbar,
  DashboardTopbarLink,
} from "@/components/dashboard/dashboard-topbar";
import {
  IconBuild,
  IconChevronRight,
  IconCheck,
  IconClock,
  IconExercises,
  IconPdf,
  IconPrograms,
  IconPublished,
  IconUpload,
} from "@/components/dashboard/icons";
import { getDashboardOverview } from "@/lib/data/queries";

function formatDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

export default async function DashboardOverviewPage() {
  const session = await requireUser();
  const overview = await getDashboardOverview(session.id);
  const {
    exerciseCount,
    programCount,
    publishedCount,
    draftCount,
    recentPrograms,
    recentExercises,
  } = overview;

  return (
    <>
      <DashboardTopbar>
        <DashboardTopbarLink href="/dashboard/programs/new" primary>
          New program
        </DashboardTopbarLink>
      </DashboardTopbar>

      <div className="dashboard-content dashboard-content--overview">
        <div className="dash-welcome">
          <div className="dash-welcome-text">
            <p className="dash-welcome-date">{formatDate()}</p>
            <h1 className="dash-welcome-title">
              Good {getGreeting()}, {firstName(session.name)}
            </h1>
            <p className="dash-welcome-sub">
              Your exercise library and programs at a glance. Everything you need
              to prescribe movement with confidence.
            </p>
          </div>
          <div className="dash-welcome-actions">
            <Link href="/dashboard/exercises/new" className="dash-action-card">
              <span className="dash-action-icon dash-action-icon--teal">
                <IconUpload />
              </span>
              <span className="dash-action-body">
                <strong>Upload exercise</strong>
                <span>Video, audio, text &amp; thumbnails</span>
              </span>
              <IconChevronRight className="dash-action-arrow" />
            </Link>
            <Link href="/dashboard/programs/new" className="dash-action-card">
              <span className="dash-action-icon dash-action-icon--indigo">
                <IconBuild />
              </span>
              <span className="dash-action-body">
                <strong>Build program</strong>
                <span>Order, prescribe sets &amp; reps</span>
              </span>
              <IconChevronRight className="dash-action-arrow" />
            </Link>
          </div>
        </div>

        <div className="dash-stat-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon dash-stat-icon--teal">
                <IconExercises />
              </span>
            </div>
            <div className="dash-stat-value">{exerciseCount}</div>
            <div className="dash-stat-label">Exercises in library</div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon dash-stat-icon--indigo">
                <IconPrograms />
              </span>
              <span className="dash-stat-trend">{draftCount} draft</span>
            </div>
            <div className="dash-stat-value">{programCount}</div>
            <div className="dash-stat-label">Total programs</div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon dash-stat-icon--emerald">
                <IconPublished />
              </span>
              {publishedCount > 0 && (
                <span className="dash-stat-trend dash-stat-trend--up">Active</span>
              )}
            </div>
            <div className="dash-stat-value">{publishedCount}</div>
            <div className="dash-stat-label">Published programs</div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon dash-stat-icon--teal">
                <IconPdf />
              </span>
              <span className="dash-stat-trend">Auto-generated</span>
            </div>
            <div className="dash-stat-value">{publishedCount}</div>
            <div className="dash-stat-label">PDF exports ready</div>
          </div>
        </div>

        <div className="dash-bento dash-bento--overview">
          <section className="dash-panel dash-panel-programs">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Recent programs</h2>
                <p className="dash-panel-sub">Latest programs in your workspace</p>
              </div>
              <Link href="/dashboard/programs" className="dash-panel-link">
                View all
                <IconChevronRight />
              </Link>
            </div>
            {recentPrograms.length === 0 ? (
              <p className="dash-panel-empty">No programs yet. Create your first program.</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Exercises</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPrograms.map((program) => (
                      <tr key={program.id}>
                        <td>
                          <Link href={`/dashboard/programs/${program.id}`} className="dash-table-name">
                            {program.name}
                          </Link>
                        </td>
                        <td>{program.exerciseCount}</td>
                        <td>
                          <span
                            className={`badge ${program.status === "published" ? "badge-success" : "badge-muted"
                              }`}
                          >
                            {program.status}
                          </span>
                        </td>
                        <td className="dash-table-muted">{program.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="dash-panel dash-panel-workflow">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Program workflow</h2>
                <p className="dash-panel-sub">From upload to patient delivery</p>
              </div>
            </div>
            <ol className="dash-workflow">
              <li className={`dash-workflow-step${exerciseCount > 0 ? " is-done" : " is-current"}`}>
                <span className="dash-workflow-marker">
                  {exerciseCount > 0 ? <IconCheck /> : <IconClock />}
                </span>
                <div>
                  <strong>Upload exercises</strong>
                  <p>Record 3–5 reps with audio, text &amp; thumbnails</p>
                </div>
              </li>
              <li className={`dash-workflow-step${programCount > 0 ? " is-done" : exerciseCount > 0 ? " is-current" : ""}`}>
                <span className="dash-workflow-marker">
                  {programCount > 0 ? <IconCheck /> : <IconClock />}
                </span>
                <div>
                  <strong>Build program</strong>
                  <p>Order exercises and prescribe sets, reps &amp; weight</p>
                </div>
              </li>
              <li className={`dash-workflow-step${publishedCount > 0 ? " is-done" : programCount > 0 ? " is-current" : ""}`}>
                <span className="dash-workflow-marker">
                  {publishedCount > 0 ? <IconCheck /> : <IconClock />}
                </span>
                <div>
                  <strong>Deliver to patient</strong>
                  <p>Video program + auto-generated PDF export</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="dash-panel dash-panel-exercises">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Exercise library</h2>
                <p className="dash-panel-sub">Recently updated demonstrations</p>
              </div>
              <Link href="/dashboard/exercises" className="dash-panel-link">
                View all
                <IconChevronRight />
              </Link>
            </div>
            {recentExercises.length === 0 ? (
              <p className="dash-panel-empty">No exercises yet. Upload your first demonstration.</p>
            ) : (
              <ul className="dash-exercise-list">
                {recentExercises.map((exercise) => (
                  <li key={exercise.id}>
                    <Link href={`/dashboard/exercises/${exercise.id}`} className="dash-exercise-item">
                      <span className="dash-exercise-thumb" aria-hidden="true">
                        <IconExercises />
                      </span>
                      <span className="dash-exercise-body">
                        <strong>{exercise.name}</strong>
                        <span>
                          {exercise.videoDuration}
                          {exercise.hasAudio ? " · Audio" : ""}
                          {exercise.thumbnails > 0 ? ` · ${exercise.thumbnails} thumbs` : ""}
                        </span>
                      </span>
                      <span className="dash-exercise-date">{exercise.updatedAt}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
