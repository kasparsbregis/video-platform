import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import "../app.css";

export const metadata: Metadata = {
  title: "Sign in - KUSTIO",
};

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true" />
      <Suspense fallback={<div className="auth-card">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
