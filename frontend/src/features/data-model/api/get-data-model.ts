import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/datamodel";

const ResponseSchema = z.object({
  dataModel: DataModelSchema,
});

type DataModel = z.infer<typeof DataModelSchema>;

const getDataModel = async (id: string): Promise<DataModel> => {
  const axios = getAxios();
  const response = await axios.get(`/data-models/${id}`);

  const validatedData = ResponseSchema.parse(response.data);
  return validatedData.dataModel;
};

export const useGetDataModel = (id?: string) => {
  return useQuery({
    queryKey: ["data-model", id],
    queryFn: () => getDataModel(id ?? ""),
    enabled: !!id,
  });
};
