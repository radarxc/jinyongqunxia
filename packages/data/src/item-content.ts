import type { JsonValue } from '@tianshu/shared';
import { ItemDefSchema, type ItemDef } from './schemas/item';

// Runtime content loading uses this narrow value boundary instead of evaluating the full
// schema barrel (notably dialogue-only QuestDef schemas) during first-session startup.
export { ChapterDefSchema } from './schemas/chapter';
export { NpcAppearanceSchema } from './schemas/character';
export { NpcIdSchema } from './schemas/primitives';
export { RegionBindingLeafSchema } from './schemas/region-binding';
export { RegionMapSchema } from './schemas/region-map';
export { EventDefSchema } from './schemas/world';
export { WorldMapDefinitionSchema } from './schemas/world-map';
export type { ChapterDef } from './schemas/chapter';
export type { EventDef } from './schemas/world';
export type { QuestDef } from './schemas/quest';
export type { RegionMap } from './schemas/region-map';
export type { WorldMapRuntimeDefinition } from './schemas/world-map';

export type ItemRule = Omit<ItemDef, 'text'>;

interface ItemRuleEnvelope {
  readonly kind: 'item';
  readonly id: string;
  readonly value: JsonValue;
}

function envelope(value: unknown): ItemRuleEnvelope {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new TypeError('CONTENT_ITEM_RULE_INVALID');
  const row = value as Record<string, unknown>;
  if (row['kind'] !== 'item' || typeof row['id'] !== 'string' ||
      typeof row['value'] !== 'object' || row['value'] === null || Array.isArray(row['value']))
    throw new TypeError('CONTENT_ITEM_RULE_INVALID');
  return row as unknown as ItemRuleEnvelope;
}

/** Runtime schema boundary for text-free item rule leaves. */
export function parseItemRuleLeaves(values: readonly unknown[]): readonly ItemRule[] {
  const items: ItemRule[] = [];
  const ids = new Set<string>();
  for (const leaf of values) {
    if (!Array.isArray(leaf)) throw new TypeError('CONTENT_ITEM_RULE_LEAF_INVALID');
    for (const raw of leaf) {
      const row = envelope(raw);
      const parsed = ItemDefSchema.parse({ ...(row.value as Record<string, unknown>),
        text: { desc: `rule:${row.id}` } });
      if (parsed.id !== row.id || ids.has(parsed.id))
        throw new TypeError(`CONTENT_ITEM_RULE_ID_INVALID:${row.id}`);
      ids.add(parsed.id);
      const rule: Partial<ItemDef> = { ...parsed };
      delete rule.text;
      items.push(rule as ItemRule);
    }
  }
  if (items.length === 0) throw new TypeError('CONTENT_ITEM_RULES_EMPTY');
  return Object.freeze(items.map((item) => Object.freeze(item)));
}
