import { z } from "zod";

export const TabularViewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.string(),
  dataModelId: z.string().optional(),
});

export const ExtractionSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  dataModelId: z.string(),
  tabularViewId: z.string(),
  userId: z.string(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  data: z.record(z.string(), z.unknown()).optional(),
  schemaVersion: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
