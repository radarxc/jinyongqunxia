import type { ParsedBuildingType } from './types';

export const KNOWN_KITS = [
  'song_southern', 'liao_jin_north', 'yuan_north', 'yuan_south', 'ming_north',
  'ming_south', 'qing_north', 'qing_south', 'qing_early', 'song_north',
  'song_dali', 'mongol', 'tubo', 'xiyu', 'tang', 'song', 'yuan', 'ming',
] as const;

export const KNOWN_ARCHETYPES = [
  'guardhouse', 'house_large', 'house_small', 'inn', 'market_stall', 'shop_1f',
  'shop_2f', 'stable', 'temple_hall', 'wangfu', 'warehouse', 'yamen', 'biaoju',
  'casino', 'courtyard', 'house', 'manor', 'restaurant', 'shop', 'shrine', 'pagoda',
  'palace_hall', 'wharf', 'market', 'palace',
] as const;

const archetypes = new Set<string>(KNOWN_ARCHETYPES);

export function parseBuildingType(type: string): ParsedBuildingType {
  if (type.startsWith('bld_lm_')) {
    if (/^bld_lm_ch[0-9]{2}_[a-z0-9_]+$/.test(type)) return { landmark: type };
    throw new TypeError(`TOWN_PLAN_UNKNOWN_TYPE:${type}`);
  }
  if (type.startsWith('bld_kit_')) {
    const payload = type.slice('bld_kit_'.length);
    for (const kit of KNOWN_KITS) {
      const prefix = `${kit}_`;
      if (!payload.startsWith(prefix)) continue;
      const archetype = payload.slice(prefix.length);
      if (archetypes.has(archetype)) return { kit, archetype };
      break;
    }
  }
  throw new TypeError(`TOWN_PLAN_UNKNOWN_TYPE:${type}`);
}
