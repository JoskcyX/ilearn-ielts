import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { AdminResultRow } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default async function AdminResultsPage() {
  await requireRole("ADMIN");
  const { rows } = await serverFetch<{ rows: AdminResultRow[] }>("/api/admin/results");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Results</h1>
        <p className="mt-1 text-sm text-muted">
          Every practice attempt across your organization — not filtered by class, since students
          can sit any published mock test on their own.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No attempts yet"
          description="Once a student starts and submits a mock test, it will show up here."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Mock test</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Band</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/admin/results/${r.id}`} className="hover:text-brand">
                      <p className="font-medium text-foreground">{r.studentName}</p>
                      <p className="text-xs text-muted">{r.studentEmail}</p>
                    </Link>
                  </TableCell>
                  <TableCell>{r.mockTestTitle}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "SUBMITTED" ? "success" : "neutral"}>
                      {r.status === "SUBMITTED" ? "Completed" : "In progress"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {r.overallBandX10 !== null ? (r.overallBandX10 / 10).toFixed(1) : "—"}
                  </TableCell>
                  <TableCell className="text-muted">
                    {new Date(r.submittedAt ?? r.startedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
