"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await call("/api/teacher/classes", { body: { name } });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="className">New class name</Label>
        <Input
          id="className"
          placeholder="e.g. September IELTS Cohort"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create class"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
