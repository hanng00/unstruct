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

const ResponseSchema = z.object({ workspace: WorkspaceSchema });
export type Workspace = z.infer<typeof WorkspaceSchema>;

const getWorkspace = async (id: string): Promise<Workspace> => {
  const axios = getAxios();
  const res = await axios.get(`/workspaces/${id}`);
  const data = ResponseSchema.parse(res.data);
  return data.workspace;
};

export const useGetWorkspace = (id: string) => {
  return useQuery({ queryKey: ["workspace", id], queryFn: () => getWorkspace(id), enabled: Boolean(id) });
};


