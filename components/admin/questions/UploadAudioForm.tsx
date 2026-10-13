"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UploadAudioForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await call("/api/admin/audio", { form: formData });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess("Audio uploaded.");
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="audioTitle">Title</Label>
          <Input id="audioTitle" name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audioFile">Audio file (MP3, WAV, AAC, OGG — max 100MB)</Label>
          <Input id="audioFile" name="file" type="file" accept="audio/*" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audioTranscript">Transcript (optional, staff-only)</Label>
        <textarea
          id="audioTranscript"
          name="transcript"
          rows={4}
          className="w-full rounded-md border border-border bg-surface p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          placeholder="Not shown to students. Used for staff review."
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading…" : "Upload audio"}
        </Button>
        {error && <span className="text-sm text-danger">{error}</span>}
        {success && <span className="text-sm text-success">{success}</span>}
      </div>
    </form>
  );
}
