import type { JsonValue } from '@tianshu/shared';
import type { ContentEntry, ContentKind } from '../content-registry';
import { classifyField, textKeyFor } from './field-registry';

export interface SplitEntry {
  readonly rules: JsonValue; readonly text: Readonly<Record<string, string>>;
  readonly contentRefs: readonly string[]; readonly assetRefs: readonly AssetRefUse[];
}
export interface AssetRefUse { readonly asset: string; readonly pointer: string; }

function entryIdentity(kind: ContentKind, value: Record<string, unknown>): string {
  if (kind === 'regionGate') return String(value['gateId']);
  if (kind === 'regionDialogue')
    return `${String(value['chapter'])}.${String(value['sceneId'])}.${String(value['anchorId'])}`;
  if (kind === 'regionLoot') return String(value['lootRef']);
  if (kind === 'shop') return `${String(value['chapterId'])}.${String(value['key'])}`;
  if (kind === 'story') return `${String(value['chapterId'])}.${String(value['lineId'])}`;
  if (kind === 'town') return `${String(value['chapterId'])}.${String(value['cityId'])}`;
  return String(value['id']);
}

export function splitContentEntry(entry: ContentEntry): SplitEntry {
  const text: Record<string, string> = {}; const contentRefs: string[] = []; const assetRefs: AssetRefUse[] = [];
  const identity = entryIdentity(entry.kind, entry.value as Record<string, unknown>);
  const visit = (value: unknown, path: readonly string[]): JsonValue | undefined => {
    if (path.length > 0) {
      const category = classifyField(entry.kind, path);
      if (category === 'authoring') return undefined;
      if (category === 'text') {
        if (typeof value === 'string') {
          const key = textKeyFor(entry.kind, identity, path); text[key] = value;
          return { textKey: key };
        }
        if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
          return value.map((item, index) => { const key = textKeyFor(entry.kind, identity, [...path, String(index)]); text[key] = item; return { textKey: key }; });
        }
      }
      if (category === 'contentRef' && typeof value === 'string') contentRefs.push(value);
      if (category === 'assetRef' && typeof value === 'string')
        assetRefs.push({ asset: value, pointer: `/${path.join('/')}` });
      if (category === 'assetRef' && typeof value === 'object' && value !== null) {
        const collect = (child: unknown, pointer: readonly string[]): void => {
          if (typeof child === 'string') assetRefs.push({ asset: child, pointer: `/${pointer.join('/')}` });
          else if (Array.isArray(child)) child.forEach((item, index) => collect(item, [...pointer, String(index)]));
          else if (typeof child === 'object' && child !== null) Object.entries(child)
            .forEach(([key, item]) => collect(item, [...pointer, key]));
        };
        collect(value, path); return value as JsonValue;
      }
    }
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.map((item, index) => visit(item, [...path, String(index)]) ?? null);
    const result: Record<string, JsonValue> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (entry.kind === 'event' && path[0] === 'actions' && path.length === 2 &&
          key === 'text' && typeof child === 'string') {
        const textPath = [...path, key]; const textKey = textKeyFor(entry.kind, identity, textPath);
        text[textKey] = child; result['textKey'] = textKey; continue;
      }
      const next = visit(child, [...path, key]); if (next !== undefined) result[key] = next;
    }
    return result;
  };
  return { rules: visit(entry.value, [])!, text, contentRefs, assetRefs };
}
