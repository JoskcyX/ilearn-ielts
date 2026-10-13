import { serverFetch } from "@/lib/server-api";
import type { PassagesResponse } from "@/lib/types/admin-content";
import { CreatePassageForm } from "@/components/admin/questions/CreatePassageForm";
import { ContentStatusControl } from "@/components/admin/questions/ContentStatusControl";
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

export default async function AdminPassagesPage() {
  const { passages: orgPassages } = await serverFetch<PassagesResponse>("/api/admin/passages");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Passages
      </h1>

      <Card className="space-y-2 p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Add a Reading passage
        </h2>
        <CreatePassageForm />
      </Card>

      {orgPassages.length === 0 ? (
        <EmptyState title="No passages yet" description="Add one above." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Test type</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgPassages.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>
                    <Badge variant="neutral">
                      {p.testType === "ACADEMIC" ? "Academic" : "General Training"}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.bodyHtml.split(/\s+/).length} words</TableCell>
                  <TableCell>
                    <ContentStatusControl
                      id={p.id}
                      status={p.status}
                      endpoint="/api/admin/passages"
                    />
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
