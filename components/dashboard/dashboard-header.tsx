import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/landing/theme-toggle";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function DashboardHeader({ title, subtitle, actions }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-text">
        <h1 className="dashboard-header-title">{title}</h1>
        {subtitle ? <p className="dashboard-header-sub">{subtitle}</p> : null}
      </div>
      <div className="dashboard-header-actions">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
