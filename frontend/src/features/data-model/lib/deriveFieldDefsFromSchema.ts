import { FieldDef } from "@/features/workspace/models/table";

// Derive field definitions from a row-level JSON schema (not an array schema)
export function deriveFieldDefsFromSchema(schemaJson: unknown): FieldDef[] {
  const schema = (schemaJson || {}) as { properties?: Record<string, unknown> };
  const props = schema.properties as Record<string, unknown> | undefined;
  if (!props) return [];

  const toLabel = (name: string) =>
    name
      // insert space before capitals (handles camelCase / PascalCase)
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      // replace underscores with spaces (handles snake_case)
      .replace(/_/g, " ")
      // split into words
      .split(" ")
      // capitalize each word
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const parseTypeMeta = (value: Record<string, unknown>) => {
    const typeProp = value?.type as unknown;
    const typeArray = Array.isArray(typeProp)
      ? (typeProp as unknown[])
      : undefined;
    const anyOf = Array.isArray(value?.anyOf)
      ? (value.anyOf as unknown[])
      : undefined;
    const oneOf = Array.isArray(value?.oneOf)
      ? (value.oneOf as unknown[])
      : undefined;

    const fromUnion = (arr?: unknown[]) => {
      if (!arr) return undefined;
      const entries = arr.map((x) => x as Record<string, unknown>);
      const hasNull = entries.some((x) => x?.type === "null");
      const main = entries.find((x) => x?.type && x.type !== "null");
      return {
        t: String(main?.type || "string"),
        f: main?.format ? String(main.format) : undefined,
        n: hasNull,
      };
    };

    const union = fromUnion(anyOf) || fromUnion(oneOf);
    const fromTypeArray = typeArray
      ? {
          t: String(
            (typeArray.find((t) => t !== "null") ?? "string") as string
          ),
          f: value?.format ? String(value.format) : undefined,
          n: typeArray.includes("null"),
        }
      : undefined;

    const type =
      union?.t ||
      fromTypeArray?.t ||
      (value?.type ? String(value.type) : undefined);
    const format = value?.format ? String(value.format) : undefined;
    const nullable = Boolean(union?.n || fromTypeArray?.n || false);
    return { type, format, nullable } as {
      type?: string;
      format?: string;
      nullable?: boolean;
    };
  };

  return Object.entries(props).map(([name, v]) => {
    const value = (v || {}) as Record<string, unknown>;
    const meta = parseTypeMeta(value);
    return {
      name,
      label: toLabel(name),
      type: meta.type,
      format: meta.format,
      nullable: meta.nullable,
      description:
        typeof value?.description === "string"
          ? (value.description as string)
          : undefined,
    } satisfies FieldDef;
  });
}
