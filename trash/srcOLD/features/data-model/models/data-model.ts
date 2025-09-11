import { z } from "zod";

export const DataModelSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  version: z.number().int().positive().default(1),
  schemaJson: z.unknown(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DataModel = z.infer<typeof DataModelSchema>;

export const CreateDataModelSchema = z.object({
  name: z.string().min(1),
  schemaJson: z.unknown(),
});

export type CreateDataModel = z.infer<typeof CreateDataModelSchema>;
