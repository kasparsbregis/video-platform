"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogoMark } from "@/components/landing/icons";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");

  return (
    <div className="auth-card">
      <Link href="/" className="auth-logo">
        <LogoMark className="auth-logo-mark" />
        <span className="auth-logo-text">KUSTIO</span>
      </Link>

      <h1 className="auth-title">Sign in</h1>
      <p className="auth-subtitle">
        Access your exercise library and program builder.
      </p>

      {error && (
        <div className="form-error" role="alert">
          Sign in failed. Please try again.
        </div>
      )}

      <button
        type="button"
        className="app-btn app-btn-primary"
        style={{ width: "100%", marginTop: 4 }}
        onClick={() => signIn("google", { callbackUrl: next })}
      >
        Continue with Google
      </button>

      <p className="auth-footer">
        <Link href="/">← Back to homepage</Link>
      </p>
    </div>
  );
}
