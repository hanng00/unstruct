import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ExtractionSchema } from "../schemas/tabular-view";

const updateExtraction = async (
  tabularViewId: string,
  fileId: string,
  input: { data?: Record<string, unknown> }
) => {
  const axios = getAxios();
  const res = await axios.put(`/tabular-views/${tabularViewId}/extractions/${fileId}`, input);
  return z.object({ extraction: ExtractionSchema }).parse(res.data).extraction;
};

export const useUpdateExtraction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tabularViewId,
      fileId,
      input,
    }: {
      tabularViewId: string;
      fileId: string;
      input: { data?: Record<string, unknown> };
    }) => updateExtraction(tabularViewId, fileId, input),
    onSuccess: (data, variables) => {
      // Invalidate the extractions query to refetch the updated data
      qc.invalidateQueries({ queryKey: ["extractions", variables.tabularViewId] });
    },
  });
};
