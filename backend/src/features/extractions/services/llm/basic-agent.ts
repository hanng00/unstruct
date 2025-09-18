import { DataModel } from "@/features/data-model/models/data-model";
import { Agent, getGlobalTraceProvider, Runner } from "@openai/agents";
import { setupOpenAI } from "../../config/openai";
import { genericExtractionPrompt } from "./generic.prompt";
import {
  IStructuredExtractionLLM,
  StructuredExtractionArgs,
} from "./interfaces";

setupOpenAI();

export class BasicExtractionAgent
  implements IStructuredExtractionLLM
{
  async structuredExtraction<T>(
    args: StructuredExtractionArgs
  ): Promise<{ data: T; raw?: string }> {
    const { content, schema } = args;
    const agent = this.createAgent(schema);
    const runner = new Runner();

    const result = await runner.run(agent, content);
    const output = result.finalOutput as T;

    // Force flush since we're in a Lambda function
    await getGlobalTraceProvider().forceFlush();

    // Validate the output. If array, return it wrapped in an object with a key "output"
    if (Array.isArray(output)) {
      return {
        data: { output } as T,
      };
    }

    return {
      data: output,
    };
  }

  private createAgent(outputSchema: DataModel["schemaJson"]) {
    if (!outputSchema.required) outputSchema.required = [];

    return new Agent({
      name: "Assistant",
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
