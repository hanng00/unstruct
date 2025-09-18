import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  dataModelId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;


