export function getByPath(obj: unknown, path: string): unknown {
  if (obj == null || !path) return undefined;
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cur: unknown = obj;
  for (const key of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

export function getFromFlatOrPath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  const nested = getByPath(obj, path);
  if (typeof nested !== "undefined") return nested;
  if (typeof obj === "object") {
    return (obj as Record<string, unknown>)[path];
  }
  return undefined;
}


