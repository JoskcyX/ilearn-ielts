import { serverFetch } from "@/lib/server-api";
import type { AdminUserRow } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { ResetPasswordControl } from "@/components/admin/ResetPasswordControl";
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

const ROLE_BADGE_VARIANT = {
  ADMIN: "warning",
  TEACHER: "default",
  STUDENT: "neutral",
} as const;

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const { users: orgUsers } = await serverFetch<{ users: AdminUserRow[] }>("/api/admin/users");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Users
      </h1>

      <Card className="space-y-2 p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Create an account
        </h2>
        <CreateUserForm />
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_BADGE_VARIANT[u.role]}>{u.role}</Badge>
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                </TableCell>
                <TableCell>
                  <ResetPasswordControl userId={u.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
