import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const addFilesToWorkspace = async (workspaceId: string, fileIds: string[]) => {
  const axios = getAxios();
  const res = await axios.post(`/workspaces/${workspaceId}/files`, { fileIds });
  return res.data as { success: boolean };
};

export const useAddFilesToWorkspace = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileIds: string[]) => addFilesToWorkspace(workspaceId, fileIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace-rows", workspaceId] });
    },
  });
};

export async function addFiles(workspaceId: string, fileIds: string[]) {
  return addFilesToWorkspace(workspaceId, fileIds);
}
