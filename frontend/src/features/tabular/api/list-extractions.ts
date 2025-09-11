import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ExtractionSchema } from "../schemas/tabular-view";

const listExtractions = async (tabularViewId: string, limit = 50) => {
  const axios = getAxios();
  const res = await axios.get(`/tabular-views/${tabularViewId}/extractions`, {
    params: { limit },
  });
  return z
    .object({
      extractions: z.array(ExtractionSchema),
      cursor: z.string().optional(),
    })
    .parse(res.data);
};

export const useListExtractions = (tabularViewId?: string, limit = 50) => {
  return useQuery({
    queryKey: ["extractions", tabularViewId, limit],
    enabled: Boolean(tabularViewId),
    queryFn: () => listExtractions(tabularViewId!, limit),
  });
};