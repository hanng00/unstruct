import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/datamodel";
import { FieldSchema } from "../schemas/field";

const RequestSchema = z.object({
  fields: FieldSchema.array(),
});

const ResponseSchema = z.object({
  dataModel: DataModelSchema,
});

type UpdateDataModelRequest = z.infer<typeof RequestSchema>;
type DataModel = z.infer<typeof DataModelSchema>;

const updateDataModel = async (
  id: string,
  request: UpdateDataModelRequest
): Promise<DataModel> => {
  const validatedRequest = RequestSchema.parse(request);

  const axios = getAxios();
  const response = await axios.put(`/data-models/${id}`, validatedRequest);

  const validatedResponse = ResponseSchema.parse(response.data);
  return validatedResponse.dataModel;
};

export const useUpdateDataModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...request }: { id: string } & UpdateDataModelRequest) =>
      updateDataModel(id, request),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["data-models"] });
      qc.invalidateQueries({ queryKey: ["data-model", data.id] });
    },
  });
};
