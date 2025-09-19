import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/datamodel";
import { FieldSchema } from "../schemas/field";

const RequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: FieldSchema.array(),
});

const ResponseSchema = z.object({
  dataModel: DataModelSchema,
});

type CreateDataModelRequest = z.infer<typeof RequestSchema>;
type DataModel = z.infer<typeof DataModelSchema>;

const createDataModel = async (
  request: CreateDataModelRequest
): Promise<DataModel> => {
  const validatedRequest = RequestSchema.parse(request);

  const axios = getAxios();
  const response = await axios.post("/data-models", validatedRequest);

  const validatedResponse = ResponseSchema.parse(response.data);
  return validatedResponse.dataModel;
};

export const useCreateDataModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDataModel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["data-models"] });
    },
  });
};
