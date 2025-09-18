import { z } from "zod";

export type PrimitiveType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "datetime"
  | "array"
  | "object"
  | "null";

export const normalizeType = (input?: string): PrimitiveType => {
  const t = (input || "string").toLowerCase();
  if (["number", "float", "double", "decimal", "numeric"].includes(t))
    return "number";
  if (["integer", "int", "long"].includes(t)) return "integer";
  if (["boolean", "bool"].includes(t)) return "boolean";
  if (["date", "datetime", "date-time", "timestamp", "time"].includes(t))
    return "datetime";
  if (["array", "list"].includes(t)) return "array";
  if (["object", "map", "record", "json"].includes(t)) return "object";
  if (["null", "nil"].includes(t)) return "null";
  // text, string, email, url, uuid etc. -> string
  return "string";
};

export const buildZodSchemaForType = (
  type?: string,
  format?: string
): z.ZodTypeAny => {
  // If declared as string but with date-like format, treat as date
  if (
    (type || "").toLowerCase() === "string" &&
    format &&
    ["date", "date-time", "datetime", "time", "timestamp"].includes(
      format.toLowerCase()
    )
  ) {
    const parse = (v: string): Date | null => {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    return z.union([
      z.date(),
      z.string().transform((v, ctx) => {
        const d = parse(v);
        if (d) return d;
        ctx.addIssue({
          code: "invalid_type",
          expected: "date",
          message: "Invalid date",
        });
        return z.NEVER;
      }),
    ]);
  }

  const t = normalizeType(type);
  switch (t) {
    case "number":
      return z.union([
        z.number(),
        z.string().transform((v, ctx) => {
          const n = Number(v);
          if (Number.isFinite(n)) return n;
          ctx.addIssue({
            code: "invalid_type",
            expected: "number",
            message: "Invalid number",
          });
          return z.NEVER;
        }),
      ]);
    case "integer":
      return z.union([
        z.number().int(),
        z.string().transform((v, ctx) => {
          if (/^[+-]?\d+$/.test(v)) return parseInt(v, 10);
          ctx.addIssue({
            code: "invalid_type",
            expected: "number",
            message: "Invalid integer",
          });
          return z.NEVER;
        }),
      ]);
    case "boolean":
      return z.union([
        z.boolean(),
        z.string().transform((v, ctx) => {
          const lower = v.toLowerCase();
          if (["true", "1", "yes", "y"].includes(lower)) return true;
          if (["false", "0", "no", "n"].includes(lower)) return false;
          ctx.addIssue({
            code: "invalid_type",
            expected: "boolean",
            message: "Invalid boolean",
          });
          return z.NEVER;
        }),
      ]);
    case "date":
    case "datetime": {
      const parse = (v: string): Date | null => {
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? null : d;
      };
      return z.union([
        z.date(),
        z.string().transform((v, ctx) => {
          const d = parse(v);
          if (d) return d;
          ctx.addIssue({
            code: "invalid_type",
            expected: "date",
            message: "Invalid date",
          });
          return z.NEVER;
        }),
      ]);
    }
    case "array":
      return z.union([
        z.array(z.any()),
        z.string().transform((v) => {
          try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [v];
          }
        }),
      ]);
    case "object":
      return z.union([
        z.record(z.any(), z.any()),
        z.string().transform((v, ctx) => {
          try {
            const parsed = JSON.parse(v);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
              return parsed;
          } catch {}
          ctx.addIssue({
            code: "invalid_type",
            expected: "object",
            message: "Invalid JSON",
          });
          return z.NEVER;
        }),
      ]);
    case "null":
      return z.null();
    case "string":
    default:
      if (format === "email") return z.string().email();
      if (format === "uri" || format === "url") return z.string().url();
      if (format === "uuid") return z.string().uuid();
      return z.string();
  }
};

export function validateAndCoerce(
  value: unknown,
  type?: string,
  format?: string,
  nullable?: boolean
): { ok: true; value: unknown } | { ok: false; error: string } {
  let schema = buildZodSchemaForType(type, format);
  if (nullable) {
    schema = schema.nullable();
  }
  const result = schema.safeParse(value);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  const message = result.error.issues[0]?.message || "Invalid value";
  return { ok: false, error: message };
}

export function getTypeIconLabel(type?: string): string {
  const t = normalizeType(type);
  switch (t) {
    case "number":
    case "integer":
      return "123";
    case "boolean":
      return "01";
    case "date":
    case "datetime":
      return "📅";
    case "array":
      return "[]";
    case "object":
      return "{}";
    case "null":
      return "Ø";
    case "string":
    default:
      return "T";
  }
}
