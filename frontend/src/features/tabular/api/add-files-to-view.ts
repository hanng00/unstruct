import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const addFilesToTabularView = async (tabularViewId: string, fileIds: string[]) => {
  const axios = getAxios();
  const res = await axios.post(`/tabular-views/${tabularViewId}/files`, { fileIds });
  return z.object({ enqueued: z.number() }).parse(res.data);
};

export const useAddFilesToView = (tabularViewId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileIds: string[]) => addFilesToTabularView(tabularViewId, fileIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extractions", tabularViewId] });
      qc.invalidateQueries({ queryKey: ["tabular-view", tabularViewId] });
    },
  });
};

// Non-hook utility for imperative calls (optional usage)
export async function addFilesToView(tabularViewId: string, fileIds: string[]) {
  return addFilesToTabularView(tabularViewId, fileIds);
}
