import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell mode="login" title="Welcome back" subtitle="Sign in to pick up where you left off">
      <Suspense>
        <LoginForm />
      </Suspense>
      <div className="mt-6 flex flex-col items-center gap-1.5 text-sm text-muted">
        <Link href="/forgot-password" className="hover:text-brand hover:underline">Forgot password?</Link>
        <p>
          New here?{" "}
          <Link href="/register" className="font-semibold text-foreground underline underline-offset-4 hover:text-brand">Create an account</Link>
        </p>
      </div>
    </AuthShell>
  );
}
