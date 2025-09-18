import { getAxios } from "@/hooks/use-axios";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

const RequestSchema = z.object({
  workspaceId: z.string(),
  fileIds: z.string().array(),
  pivotOn: z.string().optional(),
});

export const runWorkspaceExtractions = async (
  args: z.infer<typeof RequestSchema>
) => {
  const validatedArgs = RequestSchema.parse(args);
  const { workspaceId, fileIds, pivotOn } = validatedArgs;

  const axios = getAxios();
  const res = await axios.post(`/workspaces/${workspaceId}/extractions/run`, {
    fileIds,
    pivotOn,
  });
  return res.data;
};

export const useRunWorkspaceExtractions = (
  options?: UseMutationOptions<
    z.infer<typeof RequestSchema>,
    Error,
    z.infer<typeof RequestSchema>
  >
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: z.infer<typeof RequestSchema>) =>
      runWorkspaceExtractions(args),
    onSuccess: (data, variables) => {
      const { workspaceId } = variables;
      qc.invalidateQueries({ queryKey: ["workspace-rows", workspaceId] });
    },
    ...options,
  });
};
