import { z } from "zod";

export const FileReferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative().optional(),
  status: z.enum(["pending", "completed"]),
  createdAt: z.string(),
  s3Key: z.string(),
});

export type FileReference = z.infer<typeof FileReferenceSchema>;