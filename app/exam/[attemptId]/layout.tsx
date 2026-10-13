import { requireRole } from "@/lib/auth-guard";

/**
 * The exam route tree is deliberately isolated from the dashboard layout:
 * no sidebar, no marketing nav, nothing that could distract from a timed
 * examination (§2). This is a full-height app shell (top bar + scrollable
 * middle + bottom bar, all defined by the page itself) rather than a
 * padded document — closer to how real exam software is laid out.
 */
export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("STUDENT");

  return <div className="flex h-screen flex-col overflow-hidden bg-background">{children}</div>;
}
