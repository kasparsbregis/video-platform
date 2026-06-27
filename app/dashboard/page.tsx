import Link from "next/link";
import { getSession } from "@/lib/auth/server";
import {
  DashboardTopbar,
  DashboardTopbarLink,
} from "@/components/dashboard/dashboard-topbar";
import {
  IconActivity,
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
import {
  MOCK_ACTIVITY,
  MOCK_EXERCISES,
  MOCK_PROGRAMS,
} from "@/lib/data/mock";

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

const activityIcons = {
  upload: IconUpload,
  publish: IconPublished,
  pdf: IconPdf,
  edit: IconBuild,
} as const;

export default async function DashboardOverviewPage() {
  const session = await getSession();
  const publishedPrograms = MOCK_PROGRAMS.filter((p) => p.status === "published").length;
  const draftPrograms = MOCK_PROGRAMS.length - publishedPrograms;
  const recentPrograms = [...MOCK_PROGRAMS]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
  const recentExercises = [...MOCK_EXERCISES]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

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
              Good {getGreeting()}, {firstName(session?.name ?? "there")}
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
              <span className="dash-stat-trend dash-stat-trend--up">+1 this week</span>
            </div>
            <div className="dash-stat-value">{MOCK_EXERCISES.length}</div>
            <div className="dash-stat-label">Exercises in library</div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon dash-stat-icon--indigo">
                <IconPrograms />
              </span>
              <span className="dash-stat-trend">{draftPrograms} draft</span>
            </div>
            <div className="dash-stat-value">{MOCK_PROGRAMS.length}</div>
            <div className="dash-stat-label">Total programs</div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon dash-stat-icon--emerald">
                <IconPublished />
              </span>
              <span className="dash-stat-trend dash-stat-trend--up">Active</span>
            </div>
            <div className="dash-stat-value">{publishedPrograms}</div>
            <div className="dash-stat-label">Published programs</div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon dash-stat-icon--teal">
                <IconPdf />
              </span>
              <span className="dash-stat-trend">Auto-generated</span>
            </div>
            <div className="dash-stat-value">{publishedPrograms}</div>
            <div className="dash-stat-label">PDF exports ready</div>
          </div>
        </div>

        <div className="dash-bento">
          <section className="dash-panel dash-panel--wide">
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
                          className={`badge ${
                            program.status === "published" ? "badge-success" : "badge-muted"
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
          </section>

          <section className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Recent activity</h2>
                <p className="dash-panel-sub">Latest changes in your workspace</p>
              </div>
              <IconActivity className="dash-panel-header-icon" />
            </div>
            <ul className="dash-activity-list">
              {MOCK_ACTIVITY.map((item) => {
                const Icon = activityIcons[item.type];
                return (
                  <li key={item.id} className="dash-activity-item">
                    <span className={`dash-activity-icon dash-activity-icon--${item.type}`}>
                      <Icon />
                    </span>
                    <div className="dash-activity-body">
                      <span className="dash-activity-title">{item.title}</span>
                      <span className="dash-activity-detail">{item.detail}</span>
                    </div>
                    <span className="dash-activity-time">{item.time}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="dash-panel dash-panel--workflow">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Program workflow</h2>
                <p className="dash-panel-sub">From upload to patient delivery</p>
              </div>
            </div>
            <ol className="dash-workflow">
              <li className="dash-workflow-step is-done">
                <span className="dash-workflow-marker">
                  <IconCheck />
                </span>
                <div>
                  <strong>Upload exercises</strong>
                  <p>Record 3–5 reps with audio, text &amp; thumbnails</p>
                </div>
              </li>
              <li className="dash-workflow-step is-done">
                <span className="dash-workflow-marker">
                  <IconCheck />
                </span>
                <div>
                  <strong>Build program</strong>
                  <p>Order exercises and prescribe sets, reps &amp; weight</p>
                </div>
              </li>
              <li className="dash-workflow-step is-current">
                <span className="dash-workflow-marker">
                  <IconClock />
                </span>
                <div>
                  <strong>Deliver to patient</strong>
                  <p>Video program + auto-generated PDF export</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="dash-panel dash-panel--wide">
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
