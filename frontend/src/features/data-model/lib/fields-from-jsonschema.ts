import { JSONSchema7 } from "json-schema";
import { z } from "zod";
import { Field } from "../schemas/field";

const toTitleCase = (key: string) =>
  key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w|\s\w/g, (m) => m.toUpperCase());

const isNullableSchema = (schema: Record<string, unknown>): boolean => {
  if (typeof schema.nullable === "boolean" && schema.nullable) return true;
  const typeVal = schema.type;
  if (Array.isArray(typeVal) && typeVal.includes("null")) return true;
  const combos = [schema.anyOf, schema.oneOf].find(Array.isArray) as unknown[] | undefined;
  return combos?.some(
    (s) => typeof s === "object" && s && (s as { type?: unknown }).type === "null"
  ) ?? false;
};

const extractTypeFromAnyOf = (anyOf: unknown[]): { type: string; format?: string } | null => {
  // Find the first non-null type in anyOf
  for (const schema of anyOf) {
    if (typeof schema === "object" && schema && "type" in schema) {
      const schemaObj = schema as { type: unknown; format?: unknown };
      if (schemaObj.type === "null") continue; // Skip null types
      if (typeof schemaObj.type === "string") {
        return {
          type: schemaObj.type,
          format: typeof schemaObj.format === "string" ? schemaObj.format : undefined,
        };
      }
    }
  }
  return null;
};

const createField = (
  key: string,
  propertyDefinition: JSONSchema7,
  required: boolean
): Field | null => {
  const description = typeof propertyDefinition.description === "string" 
    ? propertyDefinition.description 
    : undefined;
  
  const nullable = isNullableSchema(propertyDefinition as Record<string, unknown>);

  // Handle enum type
  if (
    propertyDefinition.enum &&
    Array.isArray(propertyDefinition.enum) &&
    propertyDefinition.enum.every((v: unknown) => typeof v === "string")
  ) {
    return {
      id: key,
      name: toTitleCase(key),
      description,
      nullable,
      required,
      type: "enum",
      enumValues: propertyDefinition.enum as string[],
    };
  }

  // Handle anyOf schemas (like { anyOf: [{ type: "string" }, { type: "null" }] })
  let typeInfo: { type: string; format?: string } | null = null;
  
  if (propertyDefinition.anyOf && Array.isArray(propertyDefinition.anyOf)) {
    typeInfo = extractTypeFromAnyOf(propertyDefinition.anyOf);
  } else if (propertyDefinition.type) {
    // Handle direct type
    typeInfo = {
      type: propertyDefinition.type as string,
      format: typeof propertyDefinition.format === "string" ? propertyDefinition.format : undefined,
    };
  }

  if (!typeInfo) return null;

  let fieldType: Field["type"] | null = null;
  if (typeInfo.type === "string") {
    fieldType = typeInfo.format === "date" || typeInfo.format === "date-time" ? "date" : "string";
  } else if (typeInfo.type === "number" || typeInfo.type === "integer") {
    fieldType = "number";
  }
  // Note: boolean and array types are not supported by the Field schema

  if (!fieldType) return null;

  return {
    id: key,
    name: toTitleCase(key),
    description,
    nullable,
    required,
    type: fieldType,
  };
};

export const fieldsFromJsonSchema = (jsonSchema: JSONSchema7): Field[] => {
  if (!jsonSchema?.properties) return [];
  
  const requiredNames = new Set(
    Array.isArray(jsonSchema.required) 
      ? jsonSchema.required.filter((v): v is string => typeof v === "string")
      : []
  );

  return Object.entries(jsonSchema.properties)
    .filter(([, definition]) => typeof definition !== "boolean")
    .map(([key, definition]) => 
      createField(key, definition as JSONSchema7, requiredNames.has(key))
    )
    .filter((field): field is Field => field !== null);
};

/**
 * High-level facade that converts a Zod schema directly to Field definitions.
 * This encapsulates all the complexity of Zod -> JSON Schema -> Fields conversion.
 */
export const fieldsFromZodSchema = (zodSchema: z.ZodTypeAny): Field[] => {
  const jsonSchema = z.toJSONSchema(zodSchema, {
    target: "draft-2020-12",
    io: "output",
    unrepresentable: "any"
  }) as JSONSchema7;
  
  return fieldsFromJsonSchema(jsonSchema);
};
