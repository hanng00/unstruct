import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  defaultSchemaId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  defaultSchemaId: z.string().optional(),
});

export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
