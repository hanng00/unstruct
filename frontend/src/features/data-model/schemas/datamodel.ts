import { z } from "zod";
import { FieldSchema } from "./field";

export const DataModelSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.number(),
  fields: FieldSchema.array(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DataModel = z.infer<typeof DataModelSchema>;