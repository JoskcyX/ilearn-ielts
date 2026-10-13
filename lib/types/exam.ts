import type { RenderableBlock } from "@/components/questions/BlocksRenderer";


export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MATCHING_HEADINGS"
  | "TRUE_FALSE_NOT_GIVEN"
  | "YES_NO_NOT_GIVEN"
  | "SHORT_ANSWER"
  | "SENTENCE_COMPLETION"
  | "SUMMARY_COMPLETION"
  | "NOTE_COMPLETION"
  | "TABLE_COMPLETION"
  | "FORM_COMPLETION"
  | "FLOW_CHART_COMPLETION"
  | "MATCHING"
  | "MAP_LABELING"
  | "DIAGRAM_LABELING";

export type StudentFacingQuestion = {
  id: string;
  questionType: QuestionType;
  questionText: string;
  orderIndex: number;
  marks: number;
  options?: string[];
  requiredSelectionCount?: number;
  maxWords?: number;
};

export type WorkspaceGroup = {
  id: string;
  part: number;
  title: string | null;
  instructions: string;
  blocks: RenderableBlock[];
  passage: { title: string; bodyHtml: string } | null;
  audio: { storageKey: string } | null;
  questions: StudentFacingQuestion[];
};

export type QuestionReviewItem = {
  questionId: string;
  section: "LISTENING" | "READING";
  part: number;
  orderIndex: number;
  questionText: string;
  questionType: QuestionType | string;
  givenText: string;
  correctText: string;
  isGraded: boolean;
  isCorrect: boolean | null;
};

export type AiAssessmentItem = {
  id: string;
  section: "WRITING" | "SPEAKING";
  taskNumber: number;
  status: "PENDING" | "COMPLETE" | "FAILED";
  criteriaScores: Record<string, number> | null;
  overallBandX10: number | null;
  feedback: string | null;
  transcript: string | null;
  errorMessage: string | null;
};

export type SpeakingRecordingItem = {
  id: string;
  part: number;
  url: string;
  durationSec: number | null;
  transcript: string | null;
};

export type SpeakingPart = {
  part: number;
  cueCardTopic?: string;
  cueCardPoints?: string[];
  prepSeconds?: number;
  speakSeconds?: number;
};

export type ExamPageData =
  | {
      view: "RESULTS";
      attemptId: string;
      mockTestTitle: string;
      attempt: {
        id: string;
        scores: Record<string, unknown> | null;
        overallBandX10: number | null;
        submittedAt: string | null;
      };
      reviewItems: QuestionReviewItem[];
      aiAssessments: AiAssessmentItem[];
      speakingRecordings: SpeakingRecordingItem[];
    }
  | {
      view: "READING_LISTENING";
      attemptId: string;
      mockTestTitle: string;
      sectionLabel: "LISTENING" | "READING";
      deadlineIso: string | null;
      isLastSection: boolean;
      groups: WorkspaceGroup[];
      initialResponses: Record<string, unknown>;
    }
  | {
      view: "WRITING_SPEAKING";
      attemptId: string;
      mockTestTitle: string;
      sectionLabel: "WRITING" | "SPEAKING";
      deadlineIso: string | null;
      isLastSection: boolean;
      writingTasks: Array<{ taskNumber: number; prompt: string }>;
      speakingParts: SpeakingPart[];
      writingResponses: Record<string, string> | null;
      speakingRecordings: Record<number, { url: string }>;
    };
