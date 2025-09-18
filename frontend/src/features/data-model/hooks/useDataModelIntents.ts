import { useMemo } from "react";
import { DataModelService, NewFieldConfig } from "../lib/data-model.service";
import { DataModelSchemaJson } from "../schemas/datamodel";

export const useDataModelIntents = (schemaJson?: DataModelSchemaJson) => {
  return useMemo(() => {
    const addField = (config: NewFieldConfig) => {
      if (!schemaJson) return schemaJson as unknown as DataModelSchemaJson;
      return DataModelService.addField(schemaJson, config);
    };

    const ensureFieldExists = (config: NewFieldConfig) => {
      if (!schemaJson) return schemaJson as unknown as DataModelSchemaJson;
      return DataModelService.ensureFieldExists(schemaJson, config);
    };

    const deriveFieldDefs = () => DataModelService.deriveFieldDefs(schemaJson);

    return {
      addField,
      ensureFieldExists,
      deriveFieldDefs,
      getRowLevelSchema: () => DataModelService.getRowLevelSchema(schemaJson),
    } as const;
  }, [schemaJson]);
};

export type UseDataModelIntents = ReturnType<typeof useDataModelIntents>;


