import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const runAllExtractions = async (tabularViewId: string) => {
  const axios = getAxios();
  const response = await axios.post(`/tabular-views/${tabularViewId}/run-extractions`);
  return response.data;
};

export const useRunAllExtractions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tabularViewId: string) => runAllExtractions(tabularViewId),
    onSuccess: (data, tabularViewId) => {
      // Invalidate extractions to refetch updated data
      qc.invalidateQueries({ queryKey: ["extractions", tabularViewId] });
    },
  });
};
