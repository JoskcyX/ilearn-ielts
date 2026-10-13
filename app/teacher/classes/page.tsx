import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { TeacherClassSummary } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { CreateClassForm } from "@/components/teacher/CreateClassForm";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/card";

export default async function TeacherClassesPage() {
  const user = await requireRole("TEACHER");

  const { classes: teacherClasses } = await serverFetch<{ classes: TeacherClassSummary[] }>("/api/teacher/classes");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Classes
      </h1>

      <Card className="p-5">
        <CreateClassForm />
      </Card>

      {teacherClasses.length === 0 ? (
        <EmptyState title="No classes yet" description="Create your first class above." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teacherClasses.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/classes/${c.id}`}
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-brand"
            >
              <p className="font-medium text-foreground">{c.name}</p>
              <p className="text-sm text-muted">
                {c.studentCount} student{c.studentCount === 1 ? "" : "s"} ·
                created {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
