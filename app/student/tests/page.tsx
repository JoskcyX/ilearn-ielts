import { serverFetch } from "@/lib/server-api";
import { requireRole } from "@/lib/auth-guard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartAttemptButton } from "@/components/exam/StartAttemptButton";

export default async function AvailableTestsPage() {
  await requireRole("STUDENT");

  const { tests: publishedTests } = await serverFetch<{
    tests: { id: string; title: string; testType: "ACADEMIC" | "GENERAL_TRAINING" }[];
  }>("/api/student/tests");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Available tests
        </h1>
        <p className="mt-1 text-sm text-muted">
          Every mock test your organization has published. Start any of them whenever you're
          ready — no class enrollment needed.
        </p>
      </div>

      {publishedTests.length === 0 ? (
        <EmptyState
          title="No mock tests are published yet"
          description="Once your organization publishes a mock test, it will show up here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {publishedTests.map((t) => (
            <Card key={t.id} className="space-y-3 p-4">
              <div>
                <p className="font-medium text-foreground">{t.title}</p>
                <Badge variant="neutral">
                  {t.testType === "ACADEMIC" ? "Academic" : "General Training"}
                </Badge>
              </div>
              <StartAttemptButton mockTestId={t.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
