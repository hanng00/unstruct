import { DataModelSchemaJson } from "@/features/data-model/models/data-model";

type SchemaPropertyValue =
  DataModelSchemaJson["properties"][keyof DataModelSchemaJson["properties"]];
  
const properyValueReplacer = (currentValue: SchemaPropertyValue) => ({
  type: "object" as const,
  properties: {
    answer: currentValue,
    rationale: {
      type: ["string", "null"],
      description:
        "Thourough motivation for how this value were derived, including citations if applicable.",
    },
  },
  required: ["answer", "rationale"],
  additionalProperties: false,
});

export const withEvidence = (schema: DataModelSchemaJson): DataModelSchemaJson => {
  // Loop through the keys, and replace the value with the properyValueReplacer
  const transformedProperties = { ...schema.properties };
  for (const key in transformedProperties) {
    transformedProperties[key] = properyValueReplacer(transformedProperties[key]);
  }
  return {
    ...schema,
    properties: transformedProperties,
  };
};
