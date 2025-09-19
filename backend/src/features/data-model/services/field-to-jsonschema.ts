import { JSONSchema7 } from "json-schema";
import { Field } from "./../models/field";

/**
 * Convert a Field definition to a JSON Schema property
 */
export function fieldToJsonSchema(field: Field): JSONSchema7 {
  const base: JSONSchema7 = {
    description: field.description,
  };

  switch (field.type) {
    case "string":
      return {
        ...base,
        type: field.nullable ? ["string", "null"] : "string",
      };
    case "number":
      return {
        ...base,
        type: field.nullable ? ["number", "null"] : "number",
      };
    case "date":
      return {
        ...base,
        type: field.nullable ? ["string", "null"] : "string",
        format: "date-time",
      };
    case "enum":
      return {
        ...base,
        type: field.nullable ? ["string", "null"] : "string",
        enum: field.enumValues,
      };
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
}

/**
 * Convert a schema definition (array of fields) to a full JSON Schema object
 */
export function schemaDefinitionToJsonSchema(fields: Field[]): JSONSchema7 {
  const properties: Record<string, JSONSchema7> = {};
  const required: string[] = [];

  for (const f of fields) {
    properties[f.id] = fieldToJsonSchema(f);
    if (f.required) {
      required.push(f.id);
    }
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}
