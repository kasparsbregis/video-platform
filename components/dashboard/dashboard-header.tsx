import { ThemeToggle } from "@/components/landing/theme-toggle";

export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="dashboard-header">
      <h1 className="dashboard-header-title">{title}</h1>
      <div className="dashboard-header-actions">
        <ThemeToggle />
      </div>
    </header>
  );
}
