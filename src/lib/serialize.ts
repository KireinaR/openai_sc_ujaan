// Recursively converts ObjectId/Date fields on Mongo documents into plain
// strings so they can cross the server/client boundary and be JSON-serialized.

type Serialized<T> = T extends { toHexString: () => string }
  ? string
  : T extends Date
    ? string
    : T extends Array<infer U>
      ? Array<Serialized<U>>
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

export function serialize<T>(value: T): Serialized<T> {
  if (value === null || value === undefined) return value as Serialized<T>;

  if (value instanceof Date) {
    return value.toISOString() as unknown as Serialized<T>;
  }

  if (
    typeof value === "object" &&
    "toHexString" in (value as Record<string, unknown>) &&
    typeof (value as { toHexString?: unknown }).toHexString === "function"
  ) {
    return (value as unknown as { toHexString: () => string }).toHexString() as unknown as Serialized<T>;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item)) as unknown as Serialized<T>;
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = serialize(val);
    }
    return out as Serialized<T>;
  }

  return value as Serialized<T>;
}
