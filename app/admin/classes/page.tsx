import { serverFetch } from "@/lib/server-api";
import type { AdminClassRow } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default async function AdminClassesPage() {
  await requireRole("ADMIN");
  const { classes: orgClasses } = await serverFetch<{ classes: AdminClassRow[] }>("/api/admin/classes");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Classes
      </h1>

      {orgClasses.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Classes are created by teachers. Once a teacher creates one, it will appear here."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgClasses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.teacherName}</TableCell>
                  <TableCell>{c.studentCount}</TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
