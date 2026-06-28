"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/landing/icons";
import { LogoutButton } from "./logout-button";
import type { SessionUser } from "@/lib/auth/types";

const mainNav = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

const libraryNav = [
  {
    href: "/dashboard/exercises",
    label: "Exercises",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2.5" />
        <path d="M10 9.5v5l4.5-2.5L10 9.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/dashboard/programs",
    label: "Programs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

const systemNav = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
      </svg>
    ),
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: typeof mainNav;
  pathname: string;
}) {
  return (
    <div className="sidebar-section">
      <span className="sidebar-section-label">{label}</span>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-link${isActive(pathname, item.href) ? " is-active" : ""}`}
        >
          <span className="sidebar-link-icon">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function DashboardSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <Link href="/dashboard" className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <LogoMark />
        </div>
        <div>
          <span className="sidebar-brand-text">KUSTIO</span>
          <span className="sidebar-brand-sub">Admin panel</span>
        </div>
      </Link>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        <NavSection label="Main" items={mainNav} pathname={pathname} />
        <NavSection label="Library" items={libraryNav} pathname={pathname} />
        <NavSection label="System" items={systemNav} pathname={pathname} />
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">{initials(user.name)}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-email">{user.email}</span>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
