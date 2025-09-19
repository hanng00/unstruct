import z from "zod";

// Each row in the extraction
export const ExtractionRecordSchema = z.object({
  id: z.string(),
  extractionId: z.string(),
  rowNumber: z.number().optional(), // Optional if you want ordering
  pivotKey: z.string().optional(), // The value of the pivot field, if any
  fields: z.record(z.string(), z.unknown()), // Flat schema fields
  approved: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ExtractionRecord = z.infer<typeof ExtractionRecordSchema>;

// The extraction run / metadata
export const ExtractionSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  dataModelId: z.string(),
  userId: z.string(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  pivotOn: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
