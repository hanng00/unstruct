import { getAxios } from "@/hooks/use-axios";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ExtractionSchema } from "../models/extraction";

const RequestSchema = z.object({
  fileId: z.string(),
  dataModelId: z.string(),
});

const ResponseSchema = z.object({
  extraction: ExtractionSchema,
});

export type Extraction = z.infer<typeof ExtractionSchema>;

const createExtraction = async (input: z.infer<typeof RequestSchema>) => {
  const validatedInput = RequestSchema.parse(input);

  const axios = getAxios();
  const response = await axios.post("/extractions", validatedInput);

  const validatedResponse = ResponseSchema.parse(response.data);
  return validatedResponse.extraction;
};

export const useCreateExtraction = () => {
  return useMutation({
    mutationFn: createExtraction,
  });
};
