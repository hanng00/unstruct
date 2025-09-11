import * as React from "react";

export interface SchemaField {
  name: string;
  type: string;
  description?: string;
}

export const useSchemaFields = (schemaJson: unknown): SchemaField[] => {
  return React.useMemo(() => {
    if (!schemaJson || typeof schemaJson !== "object") {
      return [];
    }

    const schema = schemaJson as Record<string, unknown>;
    
    // Handle different schema formats
    if (schema.properties) {
      return Object.entries(schema.properties).map(([name, field]: [string, unknown]): SchemaField => {
        const fieldObj = field as Record<string, unknown>;
        return {
          name,
          type: String(fieldObj?.type || "string"),
          description: String(fieldObj?.description || "")
        };
      });
    }
    
    if (schema.fields) {
      return (schema.fields as unknown[]).map((field: unknown): SchemaField => {
        const fieldObj = field as Record<string, unknown>;
        return {
          name: String(fieldObj?.name || fieldObj?.key || ""),
          type: String(fieldObj?.type || "string"),
          description: String(fieldObj?.description || "")
        };
      }).filter((f: SchemaField) => f.name);
    }
    
    if (Array.isArray(schema)) {
      return schema.map((field: unknown): SchemaField => {
        const fieldObj = field as Record<string, unknown>;
        return {
          name: String(fieldObj?.name || fieldObj?.key || ""),
          type: String(fieldObj?.type || "string"),
          description: String(fieldObj?.description || "")
        };
      }).filter((f: SchemaField) => f.name);
    }
    
    // If it's a flat object, use its keys
    if (typeof schema === "object") {
      return Object.keys(schema).map((name): SchemaField => ({
        name,
        type: "string", // Default type
        description: undefined
      }));
    }
    
    return [];
  }, [schemaJson]);
};
