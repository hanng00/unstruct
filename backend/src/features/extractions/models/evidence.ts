import { JSONSchema7 } from "json-schema";

type SchemaPropertyValue = NonNullable<JSONSchema7["properties"]>[string];

interface EvidenceSchema extends JSONSchema7 {
  type: "object";
  properties: Record<string, {
    type: "object";
    properties: {
      answer: SchemaPropertyValue;
      rationale: {
        type: ["string", "null"];
        description: string;
      };
    };
    required: ["answer", "rationale"];
    additionalProperties: false;
  }>;
}

const propertyValueReplacer = (currentValue: SchemaPropertyValue): EvidenceSchema["properties"][string] => ({
  type: "object" as const,
  properties: {
    answer: currentValue,
    rationale: {
      type: ["string", "null"] as const,
      description:
        "Thourough motivation for how this value was derived, including citations if applicable.",
    },
  },
  required: ["answer", "rationale"] as const,
  additionalProperties: false,
});

export const withEvidence = (schema: JSONSchema7): EvidenceSchema => {
  if (!schema.properties) {
    throw new Error("Schema must have properties to add evidence");
  }

  // Loop through the keys, and replace the value with the propertyValueReplacer
  const transformedProperties: EvidenceSchema["properties"] = {};
  
  for (const [key, value] of Object.entries(schema.properties)) {
    if (value) {
      transformedProperties[key] = propertyValueReplacer(value);
    }
  }

  return {
    ...schema,
    type: "object" as const,
    properties: transformedProperties,
  };
};
