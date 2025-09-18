import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const FileSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  status: z.string().optional(),
});

const ResponseSchema = z.object({ files: z.array(FileSchema) });
export type FileRow = z.infer<typeof FileSchema>;

const listFiles = async (workspaceId: string): Promise<FileRow[]> => {
  const axios = getAxios();
  const res = await axios.get(`/workspaces/${workspaceId}/files`);
  const data = ResponseSchema.parse(res.data);
  return data.files;
};

export const useListWorkspaceFiles = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-files", workspaceId],
    queryFn: () => listFiles(workspaceId),
    enabled: Boolean(workspaceId),
  });
};
