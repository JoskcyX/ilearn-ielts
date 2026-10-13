import { requireRole } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/classes", label: "Classes" },
];

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("TEACHER");

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      role="TEACHER"
      userName={user.name ?? user.email ?? "Teacher"}
      orgName={user.organizationName ?? "IELTS Mock Platform"}
    >
      {children}
    </DashboardShell>
  );
}
