import { runWithConcurrencyLimit } from "@/utils/concurrency";
import {
  Agent,
  Runner,
  getGlobalTraceProvider,
  withTrace,
} from "@openai/agents";
import { JSONSchema7 } from "json-schema";
import { z } from "zod";
import { setupOpenAI } from "../../config/openai";
import { genericExtractionPrompt } from "./generic.prompt";
import {
  IStructuredExtractionLLM,
  StructuredExtractionArgs,
} from "./interfaces";

setupOpenAI();

export class PivotedExtractionAgent implements IStructuredExtractionLLM {
  concurrencyLimit = 20;

  async structuredExtraction(args: StructuredExtractionArgs) {
    return await withTrace(
      "PivotedExtractionAgent.structuredExtraction",
      async () => {
        return this._structuredExtraction(args);
      }
    );
  }

  private async _structuredExtraction(args: StructuredExtractionArgs) {
    const { content, schema, pivotField } = args;

    if (!pivotField)
      throw new Error("Pivot field required for pivoted extraction");

    const pivotFieldSchema = schema.properties?.[pivotField];
    if (!pivotFieldSchema)
      throw new Error(`Pivot field "${pivotField}" not found in schema`);

    // 1) Extract pivot keys
    const pivotKeys = await this.extractPivotKeys(
      content,
      pivotField,
      pivotFieldSchema
    );

    const runner = new Runner();

    // 2) Run extraction per pivot key concurrently
    const rows: Record<string, unknown>[] = [];
    await runWithConcurrencyLimit(
      pivotKeys,
      this.concurrencyLimit,
      async (key) => {
        const perKeyContent = `${content}\n\nFocus on ${pivotField} = "${key}"\n\n`;
        const agent = this.createAgent(schema);
        const res = await runner.run(agent, perKeyContent);

        // 3) Flatten result into row-first format
        const output = res.finalOutput as Record<string, unknown>;
        rows.push(output);
      }
    );

    await getGlobalTraceProvider().forceFlush();

    return { data: rows };
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

  private createAgent(outputSchema: JSONSchema7) {
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
