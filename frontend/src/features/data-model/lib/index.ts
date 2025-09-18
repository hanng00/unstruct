import { FieldDef } from "@/features/workspace/models/table";

export type RowLevelJsonSchema = {
  properties?: Record<string, unknown>;
};

export function getFieldDefsFromDataModel(schemaJson: unknown): FieldDef[] {
  const schema = (schemaJson || {}) as RowLevelJsonSchema | { properties?: { rows?: { items?: unknown } }; row?: unknown };
  const rowLevel = (schema as { properties?: { rows?: { items?: unknown } } })?.properties?.rows?.items
    ?? (schema as { row?: unknown })?.row
    ?? schema;
  const props = (rowLevel as RowLevelJsonSchema)?.properties || {};
  const toLabel = (name: string) => name.replace(/([A-Z])/g, " $1").trim();
  return Object.entries(props).map(([name, v]) => {
    const value = (v || {}) as Record<string, unknown>;
    const typeProp = value?.type as unknown;
    const typeArray = Array.isArray(typeProp) ? (typeProp as unknown[]) : undefined;
    const anyOf = Array.isArray((value as Record<string, unknown>)?.anyOf) ? ((value as Record<string, unknown>).anyOf as unknown[]) : undefined;
    const oneOf = Array.isArray((value as Record<string, unknown>)?.oneOf) ? ((value as Record<string, unknown>).oneOf as unknown[]) : undefined;
    const fromUnion = (arr?: unknown[]) => {
      if (!arr) return undefined;
      const entries = arr.map((x) => x as Record<string, unknown>);
      const hasNull = entries.some((x) => x?.type === "null");
      const main = entries.find((x) => x?.type && x.type !== "null");
      return { t: String(main?.type || "string"), f: main?.format ? String(main.format) : undefined, n: hasNull };
    };
    const union = fromUnion(anyOf) || fromUnion(oneOf);
    const fromTypeArray = typeArray
      ? { t: String((typeArray.find((t) => t !== "null") ?? "string") as string), f: value?.format ? String(value.format) : undefined, n: typeArray.includes("null") }
      : undefined;
    const type = union?.t || fromTypeArray?.t || (value?.type ? String(value.type) : undefined);
    const format = value?.format ? String(value.format) : undefined;
    const nullable = Boolean(union?.n || fromTypeArray?.n || false);
    return {
      name,
      label: toLabel(name),
      type,
      format,
      nullable,
      description: typeof value?.description === "string" ? (value.description as string) : undefined,
    } as FieldDef;
  });
}

export function getFieldData(row: Record<string, unknown>, field: FieldDef): unknown {
  return row?.[field.name];
}


