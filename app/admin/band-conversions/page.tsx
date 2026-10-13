import { serverFetch } from "@/lib/server-api";
import type { BandConversionRow } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { AddBandConversionForm } from "@/components/admin/AddBandConversionForm";
import { DeleteBandConversionButton } from "@/components/admin/DeleteBandConversionButton";
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

export default async function BandConversionsPage() {
  await requireRole("ADMIN");
  const { rows } = await serverFetch<{ rows: BandConversionRow[] }>("/api/admin/band-conversions");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Band conversions</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          How a raw score on Listening or Reading turns into an estimated band. Seeded with the
          standard IELTS Academic tables (out of 40); add or remove rows to match your own
          question bank. Writing and Speaking aren&apos;t listed here — there's no automatic
          scoring for them yet, so attempts are marked pending review instead.
        </p>
      </div>

      <Card className="space-y-3 p-5">
        <h2 className="text-sm font-semibold text-foreground">Add a row</h2>
        <AddBandConversionForm />
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="No conversion table configured" description="Add rows above." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Test type</TableHead>
                <TableHead>Raw range</TableHead>
                <TableHead>Band</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Badge variant="neutral">{r.section}</Badge>
                  </TableCell>
                  <TableCell>
                    {r.testType === "ACADEMIC" ? "Academic" : "General Training"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {r.minRaw}–{r.maxRaw}
                  </TableCell>
                  <TableCell className="font-mono">{(r.bandX10 / 10).toFixed(1)}</TableCell>
                  <TableCell>
                    <DeleteBandConversionButton id={r.id} />
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
