import { z } from "zod";

export const SynthesisResultSchema = z.object({
  productId: z.string(),
  conflictsResolved: z.number().int().nonnegative(),
  recordsProcessed: z.number().int().nonnegative(),
});

export const SynthesisJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
  name: z.string().min(1),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  extractionIds: z.array(z.string()),
  schemaId: z.string(),
  synthesisMethod: z.enum(["manual", "llm", "rule-based"]),
  configuration: z.record(z.unknown()),
  result: SynthesisResultSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SynthesisJob = z.infer<typeof SynthesisJobSchema>;
export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;

export const CreateSynthesisJobSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1),
  extractionIds: z.array(z.string()),
  schemaId: z.string(),
  synthesisMethod: z.enum(["manual", "llm", "rule-based"]),
  configuration: z.record(z.unknown()),
});

export type CreateSynthesisJob = z.infer<typeof CreateSynthesisJobSchema>;
