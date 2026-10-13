"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SpeakingPart = {
  part: 1 | 2 | 3;
  cueCardTopic?: string;
  cueCardPoints?: string[];
  prepSeconds?: number;
  speakSeconds?: number;
};

export function SpeakingContentForm({
  sectionId,
  initialParts,
}: {
  sectionId: string;
  initialParts: SpeakingPart[] | null;
}) {
  const router = useRouter();
  const part2 = initialParts?.find((p) => p.part === 2);
  const [cueCardTopic, setCueCardTopic] = useState(part2?.cueCardTopic ?? "");
  const [cueCardPointsText, setCueCardPointsText] = useState(
    (part2?.cueCardPoints ?? []).join("\n")
  );
  const [prepSeconds, setPrepSeconds] = useState(part2?.prepSeconds ?? 60);
  const [speakSeconds, setSpeakSeconds] = useState(part2?.speakSeconds ?? 120);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await call(`/api/admin/mock-tests/sections/${sectionId}/speaking`, {
        method: "PUT",
        body: {
        parts: [
          { part: 1 },
          {
            part: 2,
            cueCardTopic,
            cueCardPoints: cueCardPointsText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            prepSeconds,
            speakSeconds,
          },
          { part: 3 },
        ],
        },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Parts 1 and 3 are examiner-led conversation (built out with the
        Phase 6 Speaking engine). Part 2&apos;s cue card is configured here.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="cueTopic">Part 2 cue card topic</Label>
        <Input
          id="cueTopic"
          value={cueCardTopic}
          onChange={(e) => setCueCardTopic(e.target.value)}
          placeholder="Describe a book you recently read."
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cuePoints">Cue card bullet points (one per line)</Label>
        <textarea
          id="cuePoints"
          value={cueCardPointsText}
          onChange={(e) => setCueCardPointsText(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-border bg-surface p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          placeholder={"what it was\nwhen you read it\nwhy you chose it\nand explain how you felt about it"}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="prepSeconds">Prep time (seconds)</Label>
          <Input
            id="prepSeconds"
            type="number"
            min={0}
            max={300}
            value={prepSeconds}
            onChange={(e) => setPrepSeconds(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="speakSeconds">Speaking time (seconds)</Label>
          <Input
            id="speakSeconds"
            type="number"
            min={30}
            max={600}
            value={speakSeconds}
            onChange={(e) => setSpeakSeconds(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save speaking parts"}
        </Button>
        {error && <span className="text-sm text-danger">{error}</span>}
        {success && <span className="text-sm text-success">Saved.</span>}
      </div>
    </form>
  );
}
