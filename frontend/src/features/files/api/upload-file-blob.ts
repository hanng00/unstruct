import { getRawAxios } from "@/hooks/use-axios";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const RequestSchema = z.object({
  presignedUrl: z.string(),
  file: z.instanceof(File),
});
type TRequest = z.infer<typeof RequestSchema> & {
  onProgress?: (progress: number) => void;
};

export const uploadFile = async (request: TRequest) => {
  const validatedRequest = RequestSchema.parse(request);

  const axios = getRawAxios();
  const response = await axios.put(
    validatedRequest.presignedUrl,
    validatedRequest.file,
    {
      headers: {
        "Content-Type": validatedRequest.file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && request.onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          request.onProgress(progress);
        }
      },
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to upload file");
  }

  return {
    success: true,
  };
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};
