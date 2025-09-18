import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { FileReferenceSchema } from "../schemas";

const ResponseSchema = z.object({
  fileReferences: z.array(FileReferenceSchema),
});

type FileReference = z.infer<typeof FileReferenceSchema>;

const listFiles = async (): Promise<FileReference[]> => {
  const axios = getAxios();
  const response = await axios.get("/files");

  const validatedData = ResponseSchema.parse(response.data);
  const files = validatedData.fileReferences;

  // Sort files by createdAt descending
  files.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return files;
};

export const useListFiles = () => {
  return useQuery({
    queryKey: ["files"],
    queryFn: listFiles,
  });
};

export type { FileReference };
