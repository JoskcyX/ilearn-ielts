import { serverFetch } from "@/lib/server-api";
import { requireRole } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StudentProfilePage() {
  const user = await requireRole("STUDENT");

  const { record } = await serverFetch<{
    record: {
      fullName: string;
      email: string;
      createdAt: string;
      lastLoginAt: string | null;
      orgName: string;
    } | null;
  }>("/api/student/profile");

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Profile
      </h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">
              {record?.fullName}
            </span>
            <Badge>Student</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Email</span>
            <span className="text-foreground">{record?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Organization</span>
            <span className="text-foreground">{record?.orgName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Account created</span>
            <span className="text-foreground">
              {record ? new Date(record.createdAt).toLocaleDateString() : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Last login</span>
            <span className="text-foreground">
              {record?.lastLoginAt
                ? record.lastLoginAt.toLocaleString()
                : "This is your first login"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
