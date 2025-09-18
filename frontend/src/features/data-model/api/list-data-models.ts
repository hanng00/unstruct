import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/datamodel";

const ResponseSchema = z.object({
  dataModels: DataModelSchema.array(),
});

type DataModel = z.infer<typeof DataModelSchema>;

const listDataModels = async (): Promise<DataModel[]> => {
  const axios = getAxios();
  const response = await axios.get("/data-models");

  const validatedData = ResponseSchema.parse(response.data);
  const dataModels = validatedData.dataModels;

  // Sort data models by createdAt descending
  dataModels.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return dataModels;
};

export const useListDataModels = () => {
  return useQuery({
    queryKey: ["data-models"],
    queryFn: listDataModels,
  });
};
