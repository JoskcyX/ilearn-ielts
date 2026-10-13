"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreatePassageForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [testType, setTestType] = useState<"ACADEMIC" | "GENERAL_TRAINING">("ACADEMIC");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await call("/api/admin/passages", {
        body: { title, bodyHtml, testType },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTitle("");
      setBodyHtml("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="passageTitle">Title</Label>
          <Input id="passageTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="passageTestType">Test type</Label>
          <select
            id="passageTestType"
            value={testType}
            onChange={(e) => setTestType(e.target.value as typeof testType)}
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="ACADEMIC">Academic</option>
            <option value="GENERAL_TRAINING">General Training</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="passageBody">Passage text</Label>
        <textarea
          id="passageBody"
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          rows={8}
          required
          className="w-full rounded-md border border-border bg-surface p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          placeholder="Paste the reading passage text here."
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Create passage"}
        </Button>
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    </form>
  );
}
