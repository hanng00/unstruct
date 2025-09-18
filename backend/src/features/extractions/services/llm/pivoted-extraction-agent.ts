import { DataModel } from "@/features/data-model/models/data-model";
import {
  Agent,
  Runner,
  getGlobalTraceProvider,
  withTrace,
} from "@openai/agents";
import { setupOpenAI } from "../../config/openai";

import { runWithConcurrencyLimit } from "@/utils/concurrency";
import { z } from "zod";
import { genericExtractionPrompt } from "./generic.prompt";
import {
  IStructuredExtractionLLM,
  StructuredExtractionArgs,
} from "./interfaces";

setupOpenAI();

export class PivotedExtractionAgent implements IStructuredExtractionLLM {
  concurrencyLimit = 20;

  async structuredExtraction(
    args: StructuredExtractionArgs
  ): Promise<{ data: Record<string, unknown>; raw?: string }> {
    return await withTrace("PivotedExtractionAgent.structuredExtraction", async () => {
      return this._structuredExtraction(args);
    });
  }

  async _structuredExtraction(
    args: StructuredExtractionArgs
  ): Promise<{ data: Record<string, unknown>; raw?: string }> {
    const { content, schema, pivotField } = args;

    if (!pivotField)
      throw new Error("Pivot field required for pivoted extraction");

    const pivotFieldSchema = schema.properties?.[pivotField];
    if (!pivotFieldSchema)
      throw new Error(`Pivot field "${pivotField}" not found in schema`);

    const pivotKeys = await this.extractPivotKeys(
      content,
      pivotField,
      pivotFieldSchema
    );

    const results: Record<string, unknown> = {};
    const runner = new Runner();

    await runWithConcurrencyLimit(
      pivotKeys,
      this.concurrencyLimit,
      async (key) => {
        const perKeyContent = `Focus on ${pivotField} = "${key}" in this document.\n\n${content}`;
        const agent = this.createAgent(schema);
        const res = await runner.run(agent, perKeyContent);
        results[key] = res.finalOutput;
      }
    );

    await getGlobalTraceProvider().forceFlush();
    return { data: results };
  }

  private async extractPivotKeys(
    content: string,
    pivotField: string,
    pivotFieldSchema: any
  ): Promise<string[]> {
    const fieldDescription = pivotFieldSchema.description || pivotField;
    const outputModel = z.object({
      keys: z.string().array().describe("All unique values for the field"),
    });

    const keyAgent = new Agent({
      name: "PivotKeyExtractor",
      model: "gpt-5-mini",
      instructions: `Extract all unique values for the field "${pivotField}". Description: "${fieldDescription}". Return as a JSON array of strings.`,
      outputType: outputModel,
    });

    const runner = new Runner();
    const result = await runner.run(keyAgent, content);
    const keys = result.finalOutput?.keys;

    if (!Array.isArray(keys)) throw new Error("Failed to extract pivot keys");
    return keys;
  }

  private createAgent(outputSchema: DataModel["schemaJson"]) {
    if (!outputSchema.required) outputSchema.required = [];

    return new Agent({
      name: "PerKeyExtractor",
      model: "gpt-5-mini",
      instructions: genericExtractionPrompt,
      outputType: {
        type: "json_schema",
        name: "output",
        // @ts-ignore
        schema: outputSchema,
      },
    });
  }
}
