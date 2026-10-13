"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { selectClass } from "./Modal";

/** Filter bar whose state lives in the URL (?section=&testType=&status=&q=). */
export function GroupFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    timer.current = setTimeout(() => setParam("q", q.trim()), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = ["section", "testType", "status", "q"].some((k) => params.get(k));

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="gf-q">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input id="gf-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title or instructions" className="pl-9" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gf-section">Section</Label>
        <select id="gf-section" className={selectClass} value={params.get("section") ?? ""} onChange={(e) => setParam("section", e.target.value)}>
          <option value="">All sections</option>
          <option value="READING">Reading</option>
          <option value="LISTENING">Listening</option>
          <option value="WRITING">Writing</option>
          <option value="SPEAKING">Speaking</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gf-type">Test type</Label>
        <select id="gf-type" className={selectClass} value={params.get("testType") ?? ""} onChange={(e) => setParam("testType", e.target.value)}>
          <option value="">All test types</option>
          <option value="ACADEMIC">Academic</option>
          <option value="GENERAL_TRAINING">General Training</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gf-status">Status</Label>
        <select id="gf-status" className={selectClass} value={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)}>
          <option value="">Any status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      {active && (
        <Button type="button" variant="ghost" onClick={() => { setQ(""); router.replace(pathname); }}>
          <X className="h-4 w-4" aria-hidden /> Clear
        </Button>
      )}
    </form>
  );
}
