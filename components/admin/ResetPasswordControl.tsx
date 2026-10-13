"use client";

import { useState, useTransition } from "react";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordControl({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return <span className="text-sm text-success">Password reset.</span>;
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Reset password
      </Button>
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await call("/api/admin/users/reset-password", {
        body: { userId, newPassword },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="password"
        placeholder="New temporary password"
        minLength={8}
        className="h-9 w-48"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        autoFocus
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Confirm"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(false)}
      >
        Cancel
      </Button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </form>
  );
}
