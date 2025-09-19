import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListWorkspaceRows } from "../api/list-workspace-rows";
import { useUpdateWorkspaceExtraction } from "../api/update-workspace-extraction";
import { useWorkspaceEditBuffer } from "../store/use-workspace-edit-buffer";

type Props = {
  workspaceId: string;
  onSuccess?: () => void;
  onError?: () => void;
};
export const useCommitWorkspaceEdits = ({
  workspaceId,
  onSuccess: onSuccessCallback,
  onError: onErrorCallback,
}: Props) => {
  // Data fetching
  const { data: rows } = useListWorkspaceRows(workspaceId);
  const workspaceFileIds = rows?.map((r) => r.fileId) || [];

  // Mutation
  const mutationUpdate = useUpdateWorkspaceExtraction();

  // Local state
  const getEdits = useWorkspaceEditBuffer((s) => s.getEdits);
  const clearEdits = useWorkspaceEditBuffer((s) => s.clearEdits);

  const qc = useQueryClient();
  const commitMutation = useMutation({
    mutationFn: async () => {
      await asyncMap(workspaceFileIds, async (fileId) => {
        const edits = getEdits(fileId);
        if (Object.keys(edits).length === 0) return;
        await mutationUpdate.mutateAsync({
          workspaceId,
          fileId,
          updates: {
            overrides: edits,
          },
        });
        clearEdits(fileId);
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workspace-rows", workspaceId] });

      onSuccessCallback?.();
    },
    onError: () => {
      onErrorCallback?.();
    },
  });

  return {
    commitWorkspaceEdits: commitMutation.mutate,
    isPending: commitMutation.isPending,
    error: commitMutation.error,
  };
};

const asyncMap = <T, R>(items: T[], taskFn: (item: T) => Promise<R>) => {
  return Promise.all(items.map(taskFn));
};
