import { DataModelSchemaJson } from "@/features/data-model/models/data-model";
import { describe, expect, it } from "vitest";
import { withEvidence } from "./evidence";

describe("withEvidence", () => {
  it("should transform properties to evidence structure", () => {
    const schema: DataModelSchemaJson = {
      $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "The name of the entity",
        },
        age: {
          type: "number",
          description: "The age of the person",
        },
      },
      required: ["name"],
      type: "object",
    };

    const result = withEvidence(schema);

    expect(result.properties.name).toEqual({
      type: "object",
      properties: {
        answer: {
          type: "string",
          description: "The name of the entity",
        },
        rationale: {
          type: ["string", "null"],
          description:
            "Thourough motivation for how this value were derived, including citations if applicable.",
        },
      },
      required: ["answer", "rationale"],
      additionalProperties: false,
    });

    expect(result.properties.age).toEqual({
      type: "object",
      properties: {
        answer: {
          type: "number",
          description: "The age of the person",
        },
        rationale: {
          type: ["string", "null"],
          description:
            "Thourough motivation for how this value were derived, including citations if applicable.",
        },
      },
      required: ["answer", "rationale"],
      additionalProperties: false,
    });
  });

  it("should handle anyOf properties", () => {
    const schema: DataModelSchemaJson = {
      $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        status: {
          anyOf: [{ type: "string" }, { type: "null" }],
          description: "The status of the entity",
        },
      },
      type: "object",
    };

    const result = withEvidence(schema);

    expect(result.properties.status).toEqual({
      type: "object",
      properties: {
        answer: {
          anyOf: [{ type: "string" }, { type: "null" }],
          description: "The status of the entity",
        },
        rationale: {
          type: ["string", "null"],
          description:
            "Thourough motivation for how this value were derived, including citations if applicable.",
        },
      },
      required: ["answer", "rationale"],
      additionalProperties: false,
    });
  });

  it("should preserve schema metadata", () => {
    const schema: DataModelSchemaJson = {
      $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
      type: "object",
    };

    const result = withEvidence(schema);

    expect(result.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(result.additionalProperties).toBe(false);
    expect(result.required).toEqual(["id"]);
    expect(result.type).toBe("object");
  });

  it("should not mutate the original schema", () => {
    const schema: DataModelSchemaJson = {
      $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "The name",
        },
      },
      type: "object",
    };

    const originalSchema = JSON.parse(JSON.stringify(schema));
    withEvidence(schema);

    expect(schema).toEqual(originalSchema);
  });
});