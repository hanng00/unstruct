import z from "zod";

export const ExtractionSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  dataModelId: z.string(),
  userId: z.string(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  pivotOn: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
  overrides: z.record(z.string(), z.unknown()).optional(),
  approved: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
