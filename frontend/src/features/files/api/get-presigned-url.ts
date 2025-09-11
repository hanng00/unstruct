import { getAxios } from "@/hooks/use-axios";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const RequestSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
});
type TRequest = z.infer<typeof RequestSchema>;

const ResponseSchema = z.object({
  fileId: z.string(),
  presignedUrl: z.string(),
});

const generatePresignedUrl = async (request: TRequest) => {
  const validatedRequest = RequestSchema.parse(request);

  const axios = getAxios();
  const response = await axios.get("/files/get-presigned-url", {
    params: {
      ...validatedRequest,
    },
  });

  const validatedData = ResponseSchema.parse(response.data);
  return validatedData;
};

export const useGeneratePresignedUrl = () => {
  return useMutation({
    mutationFn: generatePresignedUrl,
  });
};
