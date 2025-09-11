import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { DataModelSchema } from "../schemas/data-model";

const updateDataModel = async (id: string, input: { schemaJson: unknown }) => {
  const axios = getAxios();
  const res = await axios.put(`/data-models/${id}`, input);
  return z.object({ dataModel: DataModelSchema }).parse(res.data).dataModel;
};

export const useUpdateDataModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { schemaJson: unknown } }) =>
      updateDataModel(id, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["data-models"] });
      qc.setQueryData(["data-model", data.id], data);
    },
  });
};
