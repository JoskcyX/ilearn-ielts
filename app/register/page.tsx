import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell mode="register" title="Create your account" subtitle="Start your practice journey today">
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground underline underline-offset-4 hover:text-brand">Sign in</Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">Teacher and administrator accounts are set up by your organization.</p>
    </AuthShell>
  );
}
