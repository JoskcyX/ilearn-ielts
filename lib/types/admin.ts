// Response types for the admin + teacher endpoints. Dates are ISO strings.

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type AdminDashboard = {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  publishedMockCount: number;
};

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminClassRow = {
  id: string;
  name: string;
  teacherName: string;
  createdAt: string;
  studentCount: number;
};

export type BandConversionRow = {
  id: string;
  section: "LISTENING" | "READING";
  testType: "ACADEMIC" | "GENERAL_TRAINING";
  minRaw: number;
  maxRaw: number;
  bandX10: number;
};

export type AdminResultRow = {
  id: string;
  status: "IN_PROGRESS" | "SUBMITTED" | string;
  startedAt: string;
  submittedAt: string | null;
  overallBandX10: number | null;
  mockTestTitle: string;
  studentName: string;
  studentEmail: string;
};

export type QuestionReviewItem = {
  questionId: string;
  section: "LISTENING" | "READING";
  part: number;
  orderIndex: number;
  questionText: string;
  questionType: string;
  givenText: string;
  correctText: string;
  isGraded: boolean;
  isCorrect: boolean | null;
};

export type AdminResultDetail = {
  mockTestTitle: string;
  student: { name: string; email: string } | null;
  attempt: {
    id: string;
    status: string;
    scores: Record<string, unknown> | null;
    overallBandX10: number | null;
    submittedAt: string | null;
    startedAt: string;
    writingResponses: Record<string, string> | null;
  };
  writingTasks: Array<{ taskNumber: number; prompt: string }>;
  reviewItems: QuestionReviewItem[];
  // Same shapes as AiAssessmentItem / SpeakingRecordingItem used by AiAssessmentDetail.
  aiAssessments: unknown[];
  speakingRecordings: unknown[];
};

export type TeacherClassSummary = {
  id: string;
  name: string;
  createdAt: string;
  studentCount: number;
};

export type TeacherDashboard = {
  classes: TeacherClassSummary[];
  totalStudents: number;
};

export type TeacherClassDetail = {
  class: { id: string; name: string };
  students: Array<{ studentId: string; fullName: string; email: string; joinedAt: string }>;
};
