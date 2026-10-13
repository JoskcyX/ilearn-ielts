import { serverFetch } from "@/lib/server-api";
import type { TeacherDashboard } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboardPage() {
  const user = await requireRole("TEACHER");

  const { classes: teacherClasses, totalStudents } =
    await serverFetch<TeacherDashboard>("/api/teacher/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome, {user.name}
        </h1>
        <p className="text-sm text-muted">Your classes at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardValue>{teacherClasses.length}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardValue>{totalStudents}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tests assigned</CardTitle>
            <CardValue>0</CardValue>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Your classes
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/teacher/classes">Manage classes</Link>
          </Button>
        </div>
        {teacherClasses.length === 0 ? (
          <EmptyState
            title="You haven't created a class yet"
            description="Create a class to start adding students and, once mock tests are available, assigning them."
          />
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
                  {c.studentCount} student{c.studentCount === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
