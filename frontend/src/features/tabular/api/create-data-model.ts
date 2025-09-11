import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/data-model";

const createDataModel = async (input: {
  name: string;
  schemaJson: unknown;
}) => {
  const axios = getAxios();
  const res = await axios.post("/data-models", input);
  return z.object({ dataModel: DataModelSchema }).parse(res.data).dataModel;
};

export const useCreateDataModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDataModel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["data-models"] }),
  });
};
