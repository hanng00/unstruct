"use client";

import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { FileReferenceSchema } from "../schemas";

const ResponseSchema = z.object({
  fileReference: FileReferenceSchema,
});

export type FileReference = z.infer<typeof FileReferenceSchema>;

const getFile = async (fileId: string): Promise<FileReference> => {
  const axios = getAxios();
  const response = await axios.get(`/files/${fileId}`);
  const validated = ResponseSchema.parse(response.data);
  return validated.fileReference;
};

export const useGetFile = (fileId?: string | null) => {
  return useQuery({
    queryKey: ["file", fileId],
    queryFn: () => getFile(fileId ?? ""),
    enabled: !!fileId,
  });
};
