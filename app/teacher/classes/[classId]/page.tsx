import { serverFetch } from "@/lib/server-api";
import type { TeacherClassDetail } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { AddStudentForm } from "@/components/teacher/AddStudentForm";
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

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await requireRole("TEACHER");

  const { class: targetClass, students } = await serverFetch<TeacherClassDetail>(
    `/api/teacher/classes/${classId}`
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {targetClass.name}
        </h1>
        <p className="text-sm text-muted">
          {students.length} student{students.length === 1 ? "" : "s"}
        </p>
      </div>

      <Card className="p-5">
        <AddStudentForm classId={classId} />
        <p className="mt-2 text-xs text-muted">
          The student must already have an account in your organization.
        </p>
      </Card>

      {students.length === 0 ? (
        <EmptyState
          title="No students in this class yet"
          description="Add a student above by their account email."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.studentId}>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{new Date(s.joinedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
