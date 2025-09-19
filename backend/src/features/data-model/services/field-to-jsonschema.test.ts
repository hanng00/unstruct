import { describe, expect, it } from "vitest";
import { SchemaDefinition } from "./../models/field";
import { schemaDefinitionToJsonSchema } from "./field-to-jsonschema";

describe("schemaDefinitionToJsonSchema", () => {
  it("converts fields correctly", () => {
    const example: SchemaDefinition = {
      fields: [
        {
          id: "first_name",
          name: "First Name",
          type: "string",
          required: true,
          nullable: false,
        },
        {
          id: "age",
          name: "Age",
          type: "number",
          required: false,
          nullable: true,
        },
        {
          id: "birthdate",
          name: "Birthdate",
          type: "date",
          required: true,
          nullable: false,
        },
        {
          id: "favorite_color",
          name: "FavoriteColor",
          type: "enum",
          enumValues: ["red", "green", "blue"],
          required: true,
          nullable: false,
        },
      ],
    };

    const schema = schemaDefinitionToJsonSchema(example.fields);

    expect(schema).toEqual({
      type: "object",
      properties: {
        first_name: {
          type: "string",
        },
        age: {
          type: ["number", "null"],
        },
        birthdate: {
          type: "string",
          format: "date-time",
        },
        favorite_color: {
          type: "string",
          enum: ["red", "green", "blue"],
        },
      },
      required: ["first_name", "birthdate", "favorite_color"],
      additionalProperties: false,
    });
  });
});
