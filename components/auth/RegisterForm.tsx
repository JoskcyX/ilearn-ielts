"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessageFor } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton, OrDivider } from "./AuthShell";
import { PasswordField } from "./PasswordField";

type Field = "fullName" | "email" | "password" | "confirm";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errors: Record<Field, string | null> = {
    fullName: fullName.trim().length < 2 ? "Enter your full name." : null,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : "Enter a valid email address.",
    password: password.length < 8 ? "Use at least 8 characters." : null,
    confirm: confirm !== password ? "Passwords do not match." : null,
  };
  const show = (f: Field) => (touched[f] ? errors[f] : null);
  const touch = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirm: true });
    if (Object.values(errors).some(Boolean)) return;
    setSubmitting(true);
    setError(null);

    let response: Response;
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(errorMessageFor(response.status, data));
      setSubmitting(false);
      return;
    }

    try {
      await api("/api/auth/login", { method: "POST", body: { email, password } });
    } catch {
      setSubmitting(false);
      router.push("/login");
      return;
    }
    setSubmitting(false);

    router.push("/student");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Enter your full name"
          value={fullName}
          aria-invalid={show("fullName") ? true : undefined}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={touch("fullName")}
        />
        {show("fullName") && <p className="text-xs font-medium text-danger">{show("fullName")}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          aria-invalid={show("email") ? true : undefined}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={touch("email")}
        />
        {show("email") && <p className="text-xs font-medium text-danger">{show("email")}</p>}
      </div>
      <PasswordField id="password" label="Password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={setPassword} onBlur={touch("password")} error={show("password")} />
      <PasswordField id="confirm" label="Confirm password" autoComplete="new-password" placeholder="Repeat your password" value={confirm} onChange={setConfirm} onBlur={touch("confirm")} error={show("confirm")} />

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <Button type="submit" variant="coral" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
      <OrDivider />
      <GoogleButton />
    </form>
  );
}
