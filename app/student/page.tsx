import { serverFetch } from "@/lib/server-api";
import { requireRole } from "@/lib/auth-guard";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");

  const { enrolledClasses } = await serverFetch<{
    enrolledClasses: { classId: string; className: string; teacherName: string }[];
  }>("/api/student/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome, {user.name}
        </h1>
        <p className="text-sm text-muted">
          Your mock examination overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Assigned tests</CardTitle>
            <CardValue>0</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tests completed</CardTitle>
            <CardValue>0</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overall practice band</CardTitle>
            <CardValue>—</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest result</CardTitle>
            <CardValue>—</CardValue>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Your classes</h2>
        {enrolledClasses.length === 0 ? (
          <EmptyState
            title="You're not enrolled in a class yet"
            description="Once your teacher adds you to a class, it will appear here along with any tests they assign."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {enrolledClasses.map((c) => (
              <div
                key={c.classId}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <p className="font-medium text-foreground">{c.className}</p>
                <p className="text-sm text-muted">Teacher: {c.teacherName}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Performance over time
        </h2>
        <EmptyState
          title="No mock exams completed yet"
          description="Your band-score history and section performance charts will appear here after you complete your first mock examination."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Recommended areas to improve
        </h2>
        <EmptyState
          title="Not enough data yet"
          description="Recommendations are generated from your mock results, not guessed in advance — they'll appear once you've completed at least one section."
        />
      </section>
    </div>
  );
}
