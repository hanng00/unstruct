import { z } from "zod";

export const SchemaFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  isPrimaryKey: z.boolean().optional(),
  mergeStrategy: z.enum(["first", "last", "concatenate", "average"]).optional(),
  validation: z.unknown().optional(),
});

export const SynthesisRulesSchema = z.object({
  primaryKey: z.string(),
  conflictResolution: z.record(z.string()),
  llmPrompt: z.string().optional(),
});

export const SchemaDefinitionSchema = z.object({
  fields: z.array(SchemaFieldSchema),
  synthesisRules: SynthesisRulesSchema.optional(),
});

export const SchemaSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  version: z.number().int().positive(),
  definition: SchemaDefinitionSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Schema = z.infer<typeof SchemaSchema>;
export type SchemaField = z.infer<typeof SchemaFieldSchema>;
export type SynthesisRules = z.infer<typeof SynthesisRulesSchema>;
export type SchemaDefinition = z.infer<typeof SchemaDefinitionSchema>;

export const CreateSchemaSchema = z.object({
  name: z.string().min(1),
  definition: SchemaDefinitionSchema,
});

export type CreateSchema = z.infer<typeof CreateSchemaSchema>;
