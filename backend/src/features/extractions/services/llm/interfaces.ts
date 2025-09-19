import { JSONSchema7 } from "json-schema";

export type StructuredExtractionArgs = {
  content: string;
  schema: JSONSchema7;
  pivotField?: string;
};

export interface IStructuredExtractionLLM {
  structuredExtraction(args: StructuredExtractionArgs): Promise<{
    data: Record<string, unknown>;
    raw?: string; // optional raw model output for debugging
  }>;
}
