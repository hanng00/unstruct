import { getAxios } from "@/hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const RequestSchema = z.object({
  fileId: z.string(),
  status: z.enum(["completed"]),
});
type TRequest = z.infer<typeof RequestSchema>;

const updateFile = async (request: TRequest) => {
  const validatedRequest = RequestSchema.parse(request);

  const axios = getAxios();
  const response = await axios.put(`/files/${validatedRequest.fileId}`, {
    status: validatedRequest.status,
  });

  if (response.status !== 201) {
    throw new Error("Couldn't update status");
  }

  return {
    success: true,
  };
};

export const useUpdateFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateFile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
    },
  });
};
