import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ExtractionSchema } from "../models/extraction";

const ResponseSchema = z.object({
  extractions: z.array(ExtractionSchema),
});

export const useListFileExtractions = (fileId: string) => {
  const axios = getAxios();
  const fetcher = async () => {
    const res = await axios.get(`/files/${fileId}/extractions`);
    const validated = ResponseSchema.parse(res.data);
    // newest first by createdAt
    return [...validated.extractions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };
  return useQuery({
    queryKey: ["file", fileId, "extractions"],
    queryFn: fetcher,
    enabled: !!fileId,
  });
};


