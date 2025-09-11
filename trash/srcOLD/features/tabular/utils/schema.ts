/**
 * Minimal helpers for working with a serialized Zod-like schema JSON.
 * We support two common shapes:
 *  - { shape: { key: { type?: string } } }
 *  - { properties: { key: { type?: string } } } (JSON Schema-like)
 */

export type MinimalSchemaJson = {
  shape?: Record<string, { type?: string }>;
  properties?: Record<string, { type?: string }>;
};

export function getSchemaKeys(schemaJson: unknown): string[] {
  const s = (schemaJson || {}) as MinimalSchemaJson;
  const source = s.shape || s.properties || {};
  return Object.keys(source);
}

export function coerceValueByType(type: string | undefined, value: unknown): unknown {
  if (!type) return value;
  switch (type) {
    case "number": {
      const n = typeof value === "number" ? value : Number(value);
      return Number.isFinite(n) ? n : null;
    }
    case "string":
      return value == null ? null : String(value);
    case "boolean":
      if (typeof value === "boolean") return value;
      if (value === "true") return true;
      if (value === "false") return false;
      return null;
    case "date": {
      const d = new Date(String(value));
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
    default:
      return value;
  }
}

export function validateAndShape(schemaJson: unknown, raw: Record<string, unknown>): Record<string, unknown> {
  const s = (schemaJson || {}) as MinimalSchemaJson;
  const source = s.shape || s.properties || {};
  const keys = Object.keys(source);
  if (keys.length === 0) return raw;
  const shaped: Record<string, unknown> = {};
  for (const key of keys) {
    const t = (source as any)[key]?.type as string | undefined;
    shaped[key] = coerceValueByType(t, raw[key] ?? null);
  }
  return shaped;
}


