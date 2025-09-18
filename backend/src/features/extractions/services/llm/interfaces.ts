import { DataModel } from "@/features/data-model/models/data-model";

export type StructuredExtractionArgs = {
  content: string;
  schema: DataModel["schemaJson"]; // Serialized Zod schema
  pivotField?: string;
};

export interface IStructuredExtractionLLM {
  structuredExtraction(args: StructuredExtractionArgs): Promise<{
    data: Record<string, unknown>;
    raw?: string; // optional raw model output for debugging
  }>;
}
