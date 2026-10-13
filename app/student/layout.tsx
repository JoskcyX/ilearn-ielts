import { requireRole } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/tests", label: "Available tests" },
  { href: "/student/history", label: "Test history" },
  { href: "/student/profile", label: "Profile" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("STUDENT");

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      role="STUDENT"
      userName={user.name ?? user.email ?? "Student"}
      orgName={user.organizationName ?? "IELTS Mock Platform"}
    >
      {children}
    </DashboardShell>
  );
}
