"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton, OrDivider } from "./AuthShell";
import { PasswordField } from "./PasswordField";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api("/api/auth/login", { method: "POST", body: { email, password } });
    } catch (err) {
      setSubmitting(false);
      // Only a 401 means the credentials were wrong; anything else (server down,
      // validation) must not be reported as a bad password.
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Incorrect email or password." : err.message);
      } else {
        setError("Could not reach the server. Check your connection and try again.");
      }
      return;
    }
    setSubmitting(false);

    router.push(callbackUrl ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <PasswordField id="password" label="Password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={setPassword} />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" variant="coral" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <OrDivider />
      <GoogleButton />
    </form>
  );
}
