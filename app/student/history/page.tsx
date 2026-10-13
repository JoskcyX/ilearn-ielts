import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import { requireRole } from "@/lib/auth-guard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TestHistoryPage() {
  const user = await requireRole("STUDENT");

  const { rows } = await serverFetch<{
    rows: {
      id: string;
      status: "IN_PROGRESS" | "SUBMITTED";
      startedAt: string;
      submittedAt: string | null;
      overallBandX10: number | null;
      mockTestTitle: string;
    }[];
  }>("/api/student/history");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Test history</h1>

      {rows.length === 0 ? (
        <EmptyState
          title="No completed mock exams yet"
          description="Every mock you complete will be listed here with its date, section scores, and estimated practice band."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <Link key={r.id} href={`/exam/${r.id}`}>
              <Card className="space-y-2 p-4 transition-colors hover:border-brand">
                <p className="font-medium text-foreground">{r.mockTestTitle}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "SUBMITTED" ? "success" : "neutral"}>
                    {r.status === "SUBMITTED" ? "Completed" : "In progress"}
                  </Badge>
                  {r.overallBandX10 !== null && (
                    <span className="font-mono text-sm text-muted">
                      Band {(r.overallBandX10 / 10).toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  {r.submittedAt
                    ? `Submitted ${new Date(r.submittedAt).toLocaleDateString()}`
                    : `Started ${new Date(r.startedAt).toLocaleDateString()}`}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
