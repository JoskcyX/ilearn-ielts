"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateMockTestForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [testType, setTestType] = useState<"ACADEMIC" | "GENERAL_TRAINING">("ACADEMIC");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await call<{ id: string }>("/api/admin/mock-tests", {
        body: { title, testType },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/admin/mock-tests/${result.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="mockTitle">Title</Label>
        <Input
          id="mockTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Academic Mock Test 1"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mockTestType">Test type</Label>
        <select
          id="mockTestType"
          value={testType}
          onChange={(e) => setTestType(e.target.value as typeof testType)}
          className="flex h-10 rounded-md border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <option value="ACADEMIC">Academic</option>
          <option value="GENERAL_TRAINING">General Training</option>
        </select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create mock test"}
      </Button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </form>
  );
}
