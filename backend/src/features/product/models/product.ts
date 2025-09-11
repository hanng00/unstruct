import { z } from "zod";

export const SynthesisMetadataSchema = z.object({
  method: z.enum(["manual", "llm", "rule-based"]),
  synthesizedAt: z.string(),
  synthesizedBy: z.string(),
  conflictsResolved: z.number().int().nonnegative(),
});

export const ProductSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["draft", "approved", "published"]),
  synthesizedData: z.record(z.unknown()),
  sourceExtractionIds: z.array(z.string()),
  synthesisJobId: z.string(),
  synthesisMetadata: SynthesisMetadataSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
export type SynthesisMetadata = z.infer<typeof SynthesisMetadataSchema>;

export const CreateProductSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  sourceExtractionIds: z.array(z.string()),
  synthesisJobId: z.string(),
});

export type CreateProduct = z.infer<typeof CreateProductSchema>;
