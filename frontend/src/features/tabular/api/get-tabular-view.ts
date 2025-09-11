import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { TabularViewSchema } from "../schemas/tabular-view";

const getTabularView = async (tabularViewId: string) => {
  const axios = getAxios();
  const res = await axios.get(`/tabular-views/${tabularViewId}`);
  return z.object({ tv: TabularViewSchema }).parse(res.data).tv;
};

export const useGetView = (tabularViewId?: string) => {
  return useQuery({
    queryKey: ["tabular-view", tabularViewId],
    enabled: Boolean(tabularViewId),
    queryFn: () => getTabularView(tabularViewId!),
  });
};
