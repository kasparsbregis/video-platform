"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="app-btn app-btn-ghost app-btn-sm"
      onClick={handleLogout}
    >
      Sign out
    </button>
  );
}
