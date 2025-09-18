import { getAxios } from "@/hooks/use-axios";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const RequestSchema = z.object({
  workspaceId: z.string(),
  fileId: z.string(),
  updates: z.object({
    approve: z.boolean().optional(),
    overrides: z.record(z.string(), z.any()).optional(),
  }),
});

export const updateWorkspaceExtraction = async (
  args: z.infer<typeof RequestSchema>
) => {
  const validatedArgs = RequestSchema.parse(args);
  const { workspaceId, fileId, updates } = validatedArgs;

  const axios = getAxios();
  const res = await axios.put(
    `/workspaces/${workspaceId}/extractions/${fileId}`,
    updates
  );
  return res.data;
};

export const useUpdateWorkspaceExtraction = (options?: UseMutationOptions<z.infer<typeof RequestSchema>, Error, z.infer<typeof RequestSchema>>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: z.infer<typeof RequestSchema>) =>
      updateWorkspaceExtraction(args),
    onSuccess: (data, variables) => {
      const { workspaceId } = variables;
      qc.invalidateQueries({
        queryKey: ["workspace-rows", workspaceId],
      });
    },
    ...options,
  });
};
