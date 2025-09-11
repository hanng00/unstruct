import { z } from "zod";

export const FileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  s3Key: z.string(),
  status: z.enum(["uploading", "ready", "processing", "error"]),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
});

export type File = z.infer<typeof FileSchema>;

export const CreateFileSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  s3Key: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateFile = z.infer<typeof CreateFileSchema>;
