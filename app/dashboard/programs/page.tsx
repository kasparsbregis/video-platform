import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MOCK_PROGRAMS } from "@/lib/data/mock";

export default function ProgramsPage() {
  return (
    <>
      <DashboardHeader title="Programs" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Programs</h1>
            <p>Assemble exercises in order with sets, reps, time, and weight.</p>
          </div>
          <Link href="/dashboard/programs/new" className="app-btn app-btn-primary">
            New program
          </Link>
        </div>

        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Exercises</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PROGRAMS.map((program) => (
                <tr key={program.id}>
                  <td>
                    <Link
                      href={`/dashboard/programs/${program.id}`}
                      className="table-link"
                    >
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
                  <td>{program.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
