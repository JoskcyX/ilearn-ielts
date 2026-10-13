"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddStudentForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [studentEmail, setStudentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await call(`/api/teacher/classes/${classId}/students`, {
        body: { studentEmail },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(`Added ${studentEmail} to this class.`);
      setStudentEmail("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="studentEmail">Student email</Label>
        <Input
          id="studentEmail"
          type="email"
          placeholder="student@example.com"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add student"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {success && <p className="text-sm text-success">{success}</p>}
    </form>
  );
}
