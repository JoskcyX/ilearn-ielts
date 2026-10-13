import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

/**
 * Password reset needs an email service that is not wired up yet, so this page
 * says plainly what to do instead of pretending to send an email.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthShell mode="other" title="Forgot password" subtitle="Self-service reset is not available yet">
      <p className="text-center text-sm leading-relaxed text-muted">
        Contact your organization&apos;s administrator or teacher and ask them to reset your password from the admin panel.
      </p>
      <Link href="/login" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-persimmon text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
        Back to sign in
      </Link>
    </AuthShell>
  );
}
