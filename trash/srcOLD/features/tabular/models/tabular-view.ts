import { z } from "zod";

export const TabularViewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  dataModelId: z.string().optional(), // Reference to data model by ID
});

export type TabularView = z.infer<typeof TabularViewSchema>;

export const ExtractionSchema = z.object({
  id: z.string(), // unique extraction ID
  fileId: z.string(),
  dataModelId: z.string(),
  tabularViewId: z.string(),
  userId: z.string(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  data: z.record(z.string(), z.unknown()).optional(),
  schemaVersion: z.number().int().positive().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;


