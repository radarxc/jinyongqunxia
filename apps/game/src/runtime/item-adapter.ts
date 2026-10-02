import type { ItemDef } from '@tianshu/data/schemas';

const FIELD_EFFECTS = new Set([
  'healPct',
  'mpPct',
  'staPct',
  'dispel',
  'permStat',
  'permMaxPct',
]);

function supportsFieldContext(item: ItemDef): boolean {
  return item.use?.context !== 'battle';
}

function supportsFieldTarget(item: ItemDef): boolean {
  return item.use?.target === 'self' || item.use?.target === 'ally';
}

function hasSupportedEffects(item: ItemDef): boolean {
  return item.kind !== 'ammo' &&
    item.use !== undefined &&
    item.use.effects.every((effect) => FIELD_EFFECTS.has(effect.op));
}

/**
 * Presentation-only availability hint.
 * Core remains authoritative when the command is dispatched.
 */
export function useUnavailableReason(item: ItemDef): string {
  if (!item.use) return '此物不能直接服用';
  if (!supportsFieldContext(item)) return '仅能在战斗中使用';
  if (!supportsFieldTarget(item)) return '请在对应目标场景使用';
  if (!hasSupportedEffects(item))
    return '此物的完整效果尚未开放';
  return '';
}
