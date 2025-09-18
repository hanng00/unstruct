import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ExtractionSchema } from "../models/extraction";

const ResponseSchema = z.object({
  extraction: ExtractionSchema,
});

export const useGetExtraction = (extractionId: string) => {
  const axios = getAxios();
  const fetcher = async () => {
    const res = await axios.get(`/extractions/${extractionId}`);
    const validated = ResponseSchema.parse(res.data);
    return validated.extraction;
  };
  return useQuery({
    queryKey: ["extraction", extractionId],
    queryFn: fetcher,
    enabled: !!extractionId,
  });
};
