import {
  ExtractionRecordSchema,
  ExtractionSchema,
} from "@/features/extractions/models/extraction";
import { z } from "zod";
import { FileReferenceSchema } from "../files/schemas";

export const WorkspaceRowSchema = z.object({
  fileId: z.string(),
  file: FileReferenceSchema,
  extraction: ExtractionSchema.nullable(),
  records: ExtractionRecordSchema.array(),
});

export type WorkspaceRow = z.infer<typeof WorkspaceRowSchema>;
