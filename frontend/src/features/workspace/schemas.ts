import { ExtractionSchema } from "@/features/extractions/models/extraction";
import { z } from "zod";
import { FileReferenceSchema } from "../files/schemas";

export const WorkspaceRowSchema = z.object({
  fileId: z.string(),
  file: FileReferenceSchema,
  extraction: ExtractionSchema.nullable(),
});

export type WorkspaceRow = z.infer<typeof WorkspaceRowSchema>;
