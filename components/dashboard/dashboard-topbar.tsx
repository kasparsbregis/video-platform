import Link from "next/link";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { IconSearch } from "./icons";

type DashboardTopbarProps = {
  children?: React.ReactNode;
};

export function DashboardTopbar({ children }: DashboardTopbarProps) {
  return (
    <header className="dash-topbar">
      <div className="dash-topbar-search" role="search">
        <IconSearch className="dash-topbar-search-icon" />
        <input
          type="search"
          className="dash-topbar-search-input"
          placeholder="Search exercises, programs…"
          aria-label="Search exercises and programs"
        />
      </div>
      <div className="dash-topbar-actions">
        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}

export function DashboardTopbarLink({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={primary ? "app-btn app-btn-primary app-btn-sm" : "app-btn app-btn-outline app-btn-sm"}
    >
      {children}
    </Link>
  );
}
