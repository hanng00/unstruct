import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { TabularViewSchema } from "../schemas/tabular-view";

const listTabularViews = async () => {
  const axios = getAxios();

  const res = await axios.get("/tabular-views", {
    params: {},
  });
  return z.object({ views: z.array(TabularViewSchema) }).parse(res.data).views;
};

export const useListViews = () => {
  return useQuery({
    queryKey: ["tabular-views"],
    queryFn: listTabularViews,
  });
};
