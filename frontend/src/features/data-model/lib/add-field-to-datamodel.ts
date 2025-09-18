import { DataModelSchemaJson } from "@/features/data-model/schemas/datamodel";

type NewFieldConfig = {
  fieldId: string; // A pretty name for the field
  description: string; // A description for the field
  type: "string" | "number" | "boolean";
};
export const addFieldToDataModel = (
  schemaJson: DataModelSchemaJson,
  config: NewFieldConfig
) => {
  const { fieldId, description, type } = config;

  if (!/^[a-z][a-z0-9_]*$/.test(fieldId))
    throw new Error("Field id must start with a letter and use a-z, 0-9, _");

  const properties: DataModelSchemaJson["properties"] = {
    ...schemaJson.properties,
  };
  const required: DataModelSchemaJson["required"] = schemaJson.required || [];

  if (properties[fieldId] || required.includes(fieldId))
    throw new Error("Field with that id already exists");

  // Add the field to the properties and required key
  properties[fieldId] = {
    anyOf: [{ type: type }, { type: "null" }],
    ...(description && description.trim()
      ? { description: description.trim() }
      : {}),
  };

  required.push(fieldId);

  return {
    ...schemaJson,
    properties,
    required,
  };
};
