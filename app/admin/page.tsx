import { serverFetch } from "@/lib/server-api";
import type { AdminDashboard } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const stats = await serverFetch<AdminDashboard>("/api/admin/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Organization overview
        </h1>
        <p className="text-sm text-muted">
          Platform-wide status for your organization.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardValue>{stats.studentCount}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Teachers</CardTitle>
            <CardValue>{stats.teacherCount}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardValue>{stats.classCount}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published mock tests</CardTitle>
            <CardValue>{stats.publishedMockCount}</CardValue>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
