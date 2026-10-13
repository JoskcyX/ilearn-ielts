"use client";

import { useRef, useState, useTransition } from "react";
import { call } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddBandConversionForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await call("/api/admin/band-conversions", { body: {
        section: formData.get("section"),
        testType: formData.get("testType"),
        minRaw: Number(formData.get("minRaw")),
        maxRaw: Number(formData.get("maxRaw")),
        band: Number(formData.get("band")),
      } });
      if (!result.success) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 sm:grid-cols-5 sm:items-end">
      <div className="space-y-1">
        <Label htmlFor="section">Section</Label>
        <select
          id="section"
          name="section"
          required
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <option value="LISTENING">Listening</option>
          <option value="READING">Reading</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="testType">Test type</Label>
        <select
          id="testType"
          name="testType"
          required
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <option value="ACADEMIC">Academic</option>
          <option value="GENERAL_TRAINING">General Training</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="minRaw">Min raw</Label>
        <Input id="minRaw" name="minRaw" type="number" min={0} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="maxRaw">Max raw</Label>
        <Input id="maxRaw" name="maxRaw" type="number" min={0} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="band">Band</Label>
        <Input id="band" name="band" type="number" min={1} max={9} step={0.5} required />
      </div>
      <div className="sm:col-span-5">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding…" : "Add row"}
        </Button>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    </form>
  );
}
