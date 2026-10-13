"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLES = ["STUDENT", "TEACHER", "ADMIN"] as const;

export function CreateUserForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await call("/api/admin/users", {
        body: { fullName, email, password, role },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(`Created ${role.toLowerCase()} account for ${email}.`);
      setFullName("");
      setEmail("");
      setPassword("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="newUserName">Full name</Label>
        <Input
          id="newUserName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newUserEmail">Email</Label>
        <Input
          id="newUserEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newUserPassword">Temporary password</Label>
        <Input
          id="newUserPassword"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newUserRole">Role</Label>
        <select
          id="newUserRole"
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
          className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create account"}
        </Button>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {success && <p className="text-sm text-success">{success}</p>}
      </div>
    </form>
  );
}
