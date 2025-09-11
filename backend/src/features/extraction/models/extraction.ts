import { z } from "zod";

export const ExtractionSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  fileId: z.string(),
  schemaId: z.string(),
  userId: z.string(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  errorMessage: z.string().optional(),
  recordCount: z.number().int().nonnegative(),
  approvedRecordCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;

export const CreateExtractionSchema = z.object({
  workspaceId: z.string(),
  fileId: z.string(),
  schemaId: z.string(),
});

export type CreateExtraction = z.infer<typeof CreateExtractionSchema>;
