import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const FileReferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().optional(),
  status: z.enum(["pending", "completed"]),
  createdAt: z.string(),
  s3Key: z.string(),
});

const ResponseSchema = z.object({
  fileReferences: z.array(FileReferenceSchema),
});

type FileReference = z.infer<typeof FileReferenceSchema>;

const listFileReferences = async (): Promise<FileReference[]> => {
  const axios = getAxios();
  const response = await axios.get("/files");
  
  const validatedData = ResponseSchema.parse(response.data);
  return validatedData.fileReferences;
};

export const useListFileReferences = () => {
  return useQuery({
    queryKey: ["file-references"],
    queryFn: listFileReferences,
  });
};

export type { FileReference };
