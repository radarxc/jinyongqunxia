import type { TiledCompileContext, TiledObject, TiledProperty } from './tiled-types';
import { parseJsonWithPointers } from './tiled-json';
import { mapError } from './tiled-types';

export function propertyRecord(context: TiledCompileContext, properties: readonly TiledProperty[] | undefined,
  pointer: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (let index = 0; index < (properties?.length ?? 0); index += 1) {
    const property = properties![index]!;
    if (typeof property.name !== 'string' || Object.hasOwn(result, property.name))
      throw mapError(context, 'TS-CONTENT-MAP-009', 'property names must be unique strings', `${pointer}/${index}/name`);
    result[property.name] = property.value;
  }
  return result;
}

export function stringProperty(context: TiledCompileContext, properties: Record<string, unknown>, name: string,
  pointer: string, required = true): string | undefined {
  const value = properties[name];
  if ((value === undefined || value === '') && !required) return undefined;
  if (typeof value !== 'string' || value.length === 0)
    throw mapError(context, 'TS-CONTENT-MAP-009', `${name} must be a non-empty string`, pointer);
  return value;
}
export function intProperty(context: TiledCompileContext, properties: Record<string, unknown>, name: string,
  pointer: string, minimum?: number, maximum?: number): number {
  const value = properties[name];
  if (!Number.isSafeInteger(value) || minimum !== undefined && (value as number) < minimum ||
      maximum !== undefined && (value as number) > maximum)
    throw mapError(context, 'TS-CONTENT-MAP-009', `${name} must be an integer in range`, pointer);
  return value as number;
}
export function numberProperty(context: TiledCompileContext, properties: Record<string, unknown>, name: string,
  pointer: string, minimum?: number): number {
  const value = properties[name];
  if (typeof value !== 'number' || !Number.isFinite(value) || minimum !== undefined && value < minimum)
    throw mapError(context, 'TS-CONTENT-MAP-009', `${name} must be a finite number`, pointer);
  return value;
}
export function booleanProperty(context: TiledCompileContext, properties: Record<string, unknown>, name: string,
  pointer: string, fallback?: boolean): boolean {
  const value = properties[name];
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'boolean') throw mapError(context, 'TS-CONTENT-MAP-009', `${name} must be boolean`, pointer);
  return value;
}
export function listProperty(context: TiledCompileContext, properties: Record<string, unknown>, name: string,
  pointer: string, fallback?: readonly string[]): readonly string[] {
  const value = properties[name];
  if (value === undefined && fallback !== undefined) return fallback;
  const result = Array.isArray(value) ? value : typeof value === 'string' ?
    (value.trim() === '' ? [] : value.split(',').map((part) => part.trim())) : null;
  if (result === null || result.some((entry) => typeof entry !== 'string' || entry.length === 0))
    throw mapError(context, 'TS-CONTENT-MAP-009', `${name} must be a string list`, pointer);
  return result as readonly string[];
}
export function jsonProperty(context: TiledCompileContext, properties: Record<string, unknown>, name: string,
  pointer: string, fallback?: unknown): unknown {
  const value = properties[name];
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'string' || value.trim().length === 0)
    throw mapError(context, 'TS-CONTENT-MAP-009', `${name} must be non-empty JSON text`, pointer);
  try { return parseJsonWithPointers(value).value; }
  catch { throw mapError(context, 'TS-CONTENT-MAP-009', `${name} must be valid JSON`, pointer); }
}

export function objectClass(context: TiledCompileContext, object: TiledObject, pointer: string): string {
  const legacy = object.type; const current = object.class;
  if (typeof legacy === 'string' && legacy.length > 0 && typeof current === 'string' && current.length > 0 && legacy !== current)
    throw mapError(context, 'TS-CONTENT-MAP-009', 'object type and class disagree', pointer);
  const value = typeof legacy === 'string' && legacy.length > 0 ? legacy : current;
  if (typeof value !== 'string' || value.length === 0)
    throw mapError(context, 'TS-CONTENT-MAP-009', 'object class is required', pointer);
  return value;
}

export function assertOnlyProperties(context: TiledCompileContext, properties: Record<string, unknown>,
  allowed: readonly string[], pointer: string): void {
  const unknown = Object.keys(properties).find((key) => !allowed.includes(key));
  if (unknown !== undefined) throw mapError(context, 'TS-CONTENT-MAP-009', `unknown property ${unknown}`, pointer);
}
