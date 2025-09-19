import { JSONSchema7 } from "json-schema";
import {
  IStructuredExtractionLLM,
  StructuredExtractionResult,
} from "./llm/interfaces";

export class StructuredDataExtractor {
  constructor(
    private readonly llm: IStructuredExtractionLLM,
    private readonly pivotedLlm: IStructuredExtractionLLM
  ) {}

  /**
   * Extract structured rows from content.
   * Returns an array of row objects, optionally pivoted.
   */
  async extractRows(content: string, schema: JSONSchema7, pivotField?: string) {
    let result: StructuredExtractionResult;
    if (pivotField) {
      result = await this.pivotedLlm.structuredExtraction({
        content,
        schema,
        pivotField,
      });
    } else {
      result = await this.llm.structuredExtraction({
        content,
        schema,
      });
    }

    return result.data;
  }
}
