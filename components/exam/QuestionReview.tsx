import { Check, X, Minus } from "lucide-react";
import type { QuestionReviewItem } from "@/lib/types/exam";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SECTION_LABELS: Record<string, string> = {
  LISTENING: "Listening",
  READING: "Reading",
};

export function QuestionReview({ items }: { items: QuestionReviewItem[] }) {
  if (items.length === 0) return null;

  const bySection = items.reduce<Record<string, QuestionReviewItem[]>>((acc, item) => {
    (acc[item.section] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Question-by-question review</h2>
      {Object.entries(bySection).map(([section, sectionItems]) => (
        <div key={section} className="space-y-3">
          <p className="text-sm font-semibold text-muted">{SECTION_LABELS[section] ?? section}</p>
          <Card className="divide-y divide-border p-0">
            {sectionItems.map((item, i) => (
              <div key={item.questionId} className="flex items-start gap-3 p-4">
                <span
                  className={
                    item.isCorrect === true
                      ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
                      : item.isCorrect === false
                        ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger"
                        : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-soft text-muted"
                  }
                  aria-hidden
                >
                  {item.isCorrect === true ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : item.isCorrect === false ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-mono text-muted">Q{i + 1}.</span> {item.questionText}
                  </p>
                  {item.isGraded ? (
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted">
                        Your answer: <span className="font-medium text-foreground">{item.givenText}</span>
                      </span>
                      {item.isCorrect === false && (
                        <span className="text-muted">
                          Correct answer: <span className="font-medium text-success">{item.correctText}</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <Badge variant="neutral" className="mt-1.5">
                      Not auto-graded
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
