import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/data-model";

const getDataModel = async (id: string) => {
  const axios = getAxios();
  const res = await axios.get(`/data-models/${id}`);
  return z.object({ dataModel: DataModelSchema }).parse(res.data).dataModel;
};

export const useGetDataModel = (id?: string) => {
  return useQuery({
    queryKey: ["data-model", id],
    queryFn: () => getDataModel(id!),
    enabled: !!id,
  });
};