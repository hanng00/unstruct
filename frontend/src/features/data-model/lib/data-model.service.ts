import { FieldDef } from "@/features/workspace/models/table";
import { DataModelSchemaJson } from "../schemas/datamodel";
import { addFieldToDataModel } from "./add-field-to-datamodel";
import { deriveFieldDefsFromSchema } from "./deriveFieldDefsFromSchema";

export type NewFieldConfig = {
  fieldId: string;
  description: string;
  type: "string" | "number" | "boolean";
};

// Returns the row-level object schema, regardless of how it is embedded
export const getRowLevelSchema = (schemaJson: unknown): Record<string, unknown> => {
  const schema = (schemaJson || {}) as
    | { properties?: { rows?: { items?: unknown } } }
    | { row?: unknown }
    | Record<string, unknown>;
  const nested = (schema as { properties?: { rows?: { items?: unknown } } })?.properties?.rows?.items ?? (schema as { row?: unknown })?.row;
  const rowLevel = (nested ?? schema) as Record<string, unknown>;
  return rowLevel || {};
};

export const deriveFieldDefs = (schemaJson: unknown): FieldDef[] => {
  const rowLevel = getRowLevelSchema(schemaJson);
  return deriveFieldDefsFromSchema(rowLevel);
};

export const inferFieldDefsFromObject = (
  obj: Record<string, unknown>
): FieldDef[] => {
  const toLabel = (name: string) => name.replace(/([A-Z])/g, " $1").trim();
  return Object.keys(obj).map((name) => ({
    name,
    label: toLabel(name),
    type: undefined,
    format: undefined,
    nullable: true,
    description: undefined,
  }));
};

export const addField = (
  schemaJson: DataModelSchemaJson,
  config: NewFieldConfig
): DataModelSchemaJson => {
  return addFieldToDataModel(schemaJson, config);
};

// High-level intents (pure): return updated JSON schema for the caller to persist
export const ensureFieldExists = (
  schemaJson: DataModelSchemaJson,
  config: NewFieldConfig
): DataModelSchemaJson => {
  // If the field exists, return the schema unchanged; otherwise add it
  const exists = Boolean(
    (schemaJson.properties && schemaJson.properties[config.fieldId]) ||
      (schemaJson.required || []).includes(config.fieldId)
  );
  return exists ? schemaJson : addFieldToDataModel(schemaJson, config);
};

export const DataModelService = {
  getRowLevelSchema,
  deriveFieldDefs,
  inferFieldDefsFromObject,
  addField,
  ensureFieldExists,
};

export type DataModelIntents = typeof DataModelService;


