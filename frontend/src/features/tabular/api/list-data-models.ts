import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/data-model";

const listDataModels = async () => {
  const axios = getAxios();
  const res = await axios.get("/data-models");
  return z.object({ dataModels: z.array(DataModelSchema) }).parse(res.data).dataModels;
};

export const useListDataModels = () => {
  return useQuery({
    queryKey: ["data-models"],
    queryFn: listDataModels,
  });
};