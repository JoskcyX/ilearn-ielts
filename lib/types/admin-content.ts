// Response types for the admin content endpoints. Dates arrive as ISO strings.
import type { QuestionType } from "@/lib/validations/questions";
import type { Block } from "@/lib/validations/blocks";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type TestType = "ACADEMIC" | "GENERAL_TRAINING";
export type SectionName = "LISTENING" | "READING" | "WRITING" | "SPEAKING";

export type PassageRow = {
  id: string;
  organizationId: string;
  title: string;
  bodyHtml: string;
  testType: TestType;
  status: ContentStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AudioRow = {
  id: string;
  organizationId: string;
  title: string;
  storageKey: string;
  transcript: string | null;
  status: ContentStatus;
  createdBy: string | null;
  createdAt: string;
};

export type QuestionGroupRow = {
  id: string;
  organizationId: string;
  section: SectionName;
  testType: TestType;
  part: number;
  instructions: string;
  passageId: string | null;
  audioId: string | null;
  status: ContentStatus;
  createdBy: string | null;
  createdAt: string;
};

/** Row in the question-group list (GET /api/admin/question-groups). */
export type QuestionGroupListItem = {
  id: string;
  title: string | null;
  section: SectionName;
  testType: TestType;
  part: number;
  status: ContentStatus;
  instructions: string;
  questionCount: number;
  createdAt: string;
};

/** Group as returned by GET /api/admin/question-groups/:id. */
export type QuestionGroupDetail = {
  id: string;
  title: string | null;
  section: SectionName;
  testType: TestType;
  part: number;
  instructions: string;
  passageId: string | null;
  audioId: string | null;
  blocks: Block[];
  status: ContentStatus;
};

export type BuilderQuestion = {
  id: string;
  questionType: QuestionType;
  questionText: string;
  orderIndex: number;
  marks: number;
  skill: string | null;
  difficulty: string | null;
  explanation: string | null;
  status: ContentStatus;
  correctAnswer: unknown;
};

export type MediaImage = {
  id: string;
  title: string;
  altText: string | null;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  usedBy: number;
};

export type QuestionRow = {
  id: string;
  questionGroupId: string;
  questionType: QuestionType;
  questionText: string;
  orderIndex: number;
  marks: number;
  difficulty: string | null;
  skill: string | null;
  explanation: string | null;
  status: ContentStatus;
};

export type MockTestRow = {
  id: string;
  organizationId: string;
  title: string;
  testType: TestType;
  status: ContentStatus;
  createdBy: string | null;
  createdAt: string;
};

export type MockTestSectionRow = {
  id: string;
  mockTestId: string;
  section: SectionName;
  orderIndex: number;
  timeLimitSec: number;
  questionGroupIds: string[] | null;
  writingTasks: unknown;
  speakingParts: unknown;
};

export type PassagesResponse = { passages: PassageRow[] };
export type AudioResponse = { audio: AudioRow[] };
export type QuestionGroupsResponse = {
  groups: QuestionGroupListItem[];
  passages: { id: string; title: string }[];
  audioAssets: { id: string; title: string }[];
};
export type QuestionGroupDetailResponse = {
  group: QuestionGroupDetail;
  passage: PassageRow | null;
  audio: AudioRow | null;
  images: Record<string, { id: string; title: string; url: string }>;
  questions: BuilderQuestion[];
  readiness: GroupReadiness;
};
export type GroupReadiness = { ready: boolean; issues: string[]; warnings: string[] };
export type MediaResponse = { images: MediaImage[] };
export type MockTestsResponse = { mockTests: MockTestRow[] };
export type MockTestBuilderResponse = {
  mockTest: MockTestRow;
  sections: MockTestSectionRow[];
  candidateGroups: {
    id: string;
    section: SectionName;
    part: number;
    title: string;
    questionCount: number;
  }[];
};
