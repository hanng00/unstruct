import { z } from "zod";

const Type = z.enum(["string", "number", "boolean", "object", "array", "null"]);

const PropertiesValue = z.object({
  description: z.string().optional(),
  anyOf: z
    .union([
      z.object({ type: Type, items: z.object({ type: Type }).optional() }),
      z.object({ type: Type }),
    ])
    .array()
    .optional(), // Either anyOf (if Type or Null)
  type: Type.optional(), // Or simply type
});

export const DataModelSchemaJsonSchema = z.object({
  $schema: z.string(),
  additionalProperties: z.boolean(),
  properties: z.record(z.string(), PropertiesValue),
  required: z.string().array().optional(),
  type: z.literal("object"),
});

export const DataModelSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  version: z.number(),
  schemaJson: DataModelSchemaJsonSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DataModelSchemaJson = z.infer<typeof DataModelSchemaJsonSchema>;
export type DataModel = z.infer<typeof DataModelSchema>;
