import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { MockTestsResponse } from "@/lib/types/admin-content";
import { CreateMockTestForm } from "@/components/admin/mock-tests/CreateMockTestForm";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminMockTestsPage() {
  const { mockTests: orgMockTests } = await serverFetch<MockTestsResponse>(
    "/api/admin/mock-tests"
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Mock tests
      </h1>

      <Card className="space-y-2 p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Create a mock test
        </h2>
        <CreateMockTestForm />
      </Card>

      {orgMockTests.length === 0 ? (
        <EmptyState title="No mock tests yet" description="Create one above." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orgMockTests.map((m) => (
            <Link
              key={m.id}
              href={`/admin/mock-tests/${m.id}`}
              className="space-y-2 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-brand"
            >
              <p className="font-medium text-foreground">{m.title}</p>
              <div className="flex gap-2">
                <Badge variant="neutral">
                  {m.testType === "ACADEMIC" ? "Academic" : "General Training"}
                </Badge>
                <Badge
                  variant={
                    m.status === "PUBLISHED"
                      ? "success"
                      : m.status === "ARCHIVED"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {m.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
