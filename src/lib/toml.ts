import { parse } from 'smol-toml';

function toPlainObjects(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toPlainObjects);
  }

  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toPlainObjects(item)])
    );
  }

  return value;
}

export function parseToml<T>(content: string): T {
  return toPlainObjects(parse(content)) as T;
}
