import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const removeFileFromWorkspace = async (
  workspaceId: string,
  fileId: string
) => {
  const axios = getAxios();
  const res = await axios.delete(`/workspaces/${workspaceId}/files/${fileId}`);
  return res.data as { success: boolean };
};

export const useRemoveFileFromWorkspace = (workspaceId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) =>
      removeFileFromWorkspace(workspaceId || "", fileId),

    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["workspace-files", workspaceId] }),
        qc.invalidateQueries({ queryKey: ["workspace-rows", workspaceId] }),
      ]);
    },
  });
};
