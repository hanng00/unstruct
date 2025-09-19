import { Agent, getGlobalTraceProvider, Runner } from "@openai/agents";
import { JSONSchema7 } from "json-schema";
import { setupOpenAI } from "../../config/openai";
import { genericExtractionPrompt } from "./generic.prompt";
import {
  IStructuredExtractionLLM,
  StructuredExtractionArgs,
} from "./interfaces";

setupOpenAI();

export class BasicExtractionAgent implements IStructuredExtractionLLM {
  async structuredExtraction(args: StructuredExtractionArgs) {
    const { content, schema } = args;
    const agent = this.createAgent(schema);
    const runner = new Runner();

    const result = await runner.run(agent, content);
    const output = result.finalOutput as Record<string, unknown>;

    // Force flush since we're in a Lambda function
    await getGlobalTraceProvider().forceFlush();

    return {
      data: [output],
    };
  }

  private createAgent(outputSchema: JSONSchema7) {
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
