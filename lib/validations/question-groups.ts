import { z } from "zod";

export const TEST_TYPES = ["ACADEMIC", "GENERAL_TRAINING"] as const;
export const SECTIONS = ["LISTENING", "READING", "WRITING", "SPEAKING"] as const;

export const createPassageSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  bodyHtml: z.string().trim().min(1, "Passage text is required"),
  testType: z.enum(TEST_TYPES),
});
export type CreatePassageInput = z.infer<typeof createPassageSchema>;

export const audioMetaSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  transcript: z.string().trim().max(20000).optional(),
});
export type AudioMetaInput = z.infer<typeof audioMetaSchema>;

export const createQuestionGroupSchema = z
  .object({
    section: z.enum(SECTIONS),
    testType: z.enum(TEST_TYPES),
    part: z.number().int().min(1).max(4),
    instructions: z.string().trim().min(1, "Instructions are required"),
    passageId: z.string().uuid().optional(),
    audioId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.section === "READING" && !data.passageId) {
      ctx.addIssue({
        code: "custom",
        path: ["passageId"],
        message: "A Reading question group must reference a passage.",
      });
    }
    if (data.section === "LISTENING" && !data.audioId) {
      ctx.addIssue({
        code: "custom",
        path: ["audioId"],
        message: "A Listening question group must reference an audio asset.",
      });
    }
  });
export type CreateQuestionGroupInput = z.infer<typeof createQuestionGroupSchema>;
