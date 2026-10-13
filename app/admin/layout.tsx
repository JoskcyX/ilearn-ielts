import { requireRole } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/passages", label: "Passages" },
  { href: "/admin/audio", label: "Audio" },
  { href: "/admin/question-groups", label: "Question groups" },
  { href: "/admin/media", label: "Media library" },
  { href: "/admin/mock-tests", label: "Mock tests" },
  { href: "/admin/results", label: "Results" },
  { href: "/admin/band-conversions", label: "Band conversions" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      role="ADMIN"
      userName={user.name ?? user.email ?? "Administrator"}
      orgName={user.organizationName ?? "IELTS Mock Platform"}
    >
      {children}
    </DashboardShell>
  );
}
