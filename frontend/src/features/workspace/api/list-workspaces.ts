import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const WorkspaceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  dataModelId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const ResponseSchema = z.object({ workspaces: z.array(WorkspaceSchema) });
export type Workspace = z.infer<typeof WorkspaceSchema>;

const listWorkspaces = async (): Promise<Workspace[]> => {
  const axios = getAxios();
  const res = await axios.get("/workspaces");
  const data = ResponseSchema.parse(res.data);
  return data.workspaces;
};

export const useListWorkspaces = () => {
  return useQuery({ queryKey: ["workspaces"], queryFn: listWorkspaces });
};


