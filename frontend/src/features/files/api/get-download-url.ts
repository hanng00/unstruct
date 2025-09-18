"use client";

import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const ResponseSchema = z.object({ url: z.string().url() });

const getDownloadUrl = async (fileId: string): Promise<string> => {
  const axios = getAxios();
  const response = await axios.get(`/files/${fileId}/download-url`);
  const validated = ResponseSchema.parse(response.data);
  return validated.url;
};

export const useGetDownloadUrl = (fileId: string) => {
  return useQuery({
    queryKey: ["file-download-url", fileId],
    queryFn: () => getDownloadUrl(fileId),
    enabled: !!fileId,
  });
};


