import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { WorkspaceRowSchema } from "../schemas";

const ResponseSchema = z.object({ rows: WorkspaceRowSchema.array() });
export type WorkspaceRow = z.infer<typeof WorkspaceRowSchema>;

const listRows = async (workspaceId: string): Promise<WorkspaceRow[]> => {
  const axios = getAxios();
  const res = await axios.get(`/workspaces/${workspaceId}/extractions`);
  const data = ResponseSchema.parse(res.data);
  return data.rows;
};

export const useListWorkspaceRows = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-rows", workspaceId],
    queryFn: () => listRows(workspaceId),
    enabled: Boolean(workspaceId),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Poll while any extraction is in a non-terminal state
    refetchInterval: (q) => {
      const data = q.state.data as unknown as
        | Array<{ extraction?: { status?: string } }>
        | undefined;
      const inProgress = data?.some(
        (r) =>
          r.extraction?.status === "queued" ||
          r.extraction?.status === "processing"
      );
      return inProgress ? 2000 : false;
    },
  });
};
