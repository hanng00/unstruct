import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { TabularViewSchema } from "../schemas/tabular-view";

const createTabularView = async (input: {
  name: string;
  dataModelId?: string;
}) => {
  const axios = getAxios();
  const res = await axios.post("/tabular-views", input);
  return z.object({ tv: TabularViewSchema }).parse(res.data).tv;
};

export const useCreateView = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTabularView,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tabular-views"] }),
  });
};
