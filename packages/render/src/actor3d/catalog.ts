import type { QualityTier } from '../quality';
import type { ActorAssetSet, ActorCatalog, ActorLook, ActorRole } from './types';

export const GENERIC_MALE_ACTOR_TEMPLATE = 'npc_generic_m';
export const GENERIC_FEMALE_ACTOR_TEMPLATE = 'npc_generic_f';

export interface StaticActorCatalogEntry extends ActorAssetSet {
  readonly template: string;
  readonly role: ActorRole;
}

export type StaticActorCatalogEntries =
  | readonly StaticActorCatalogEntry[]
  | Readonly<Partial<Record<ActorRole, Readonly<Record<string, ActorAssetSet>>>>>;

function catalogKey(role: ActorRole, template: string): string {
  return `${role}/${template}`;
}

function addEntry(
  assets: Map<string, ActorAssetSet>, role: ActorRole, template: string, asset: ActorAssetSet,
): void {
  const key = catalogKey(role, template);
  if (assets.has(key)) throw new Error(`ACTOR_CATALOG_DUPLICATE:${role}:${template}`);
  assets.set(key, asset);
}

function addRoleEntries(
  assets: Map<string, ActorAssetSet>, role: ActorRole,
  entries: Readonly<Record<string, ActorAssetSet>> | undefined,
): void {
  if (!entries) return;
  for (const [template, asset] of Object.entries(entries)) addEntry(assets, role, template, asset);
}

/** Builds an immutable resolver from the build-time town asset manifest. */
export function createStaticActorCatalog(entries: StaticActorCatalogEntries): ActorCatalog {
  const assets = new Map<string, ActorAssetSet>();
  if (Array.isArray(entries)) {
    for (const entry of entries) addEntry(assets, entry.role, entry.template, entry);
  } else {
    const byRole = entries as Readonly<
      Partial<Record<ActorRole, Readonly<Record<string, ActorAssetSet>>>>
    >;
    addRoleEntries(assets, 'player', byRole.player);
    addRoleEntries(assets, 'npc', byRole.npc);
    addRoleEntries(assets, 'named', byRole.named);
  }

  function resolveFallback(look: ActorLook, template: string): ActorAssetSet | undefined {
    return assets.get(catalogKey(look.role, template))
      ?? assets.get(catalogKey('npc', template));
  }

  return {
    resolve(look) {
      const exact = assets.get(catalogKey(look.role, look.template));
      if (exact) return exact;
      const fallbackTemplate = look.template.startsWith('tpl_m_')
        ? GENERIC_MALE_ACTOR_TEMPLATE
        : look.template.startsWith('tpl_f_') ? GENERIC_FEMALE_ACTOR_TEMPLATE : undefined;
      const fallback = fallbackTemplate ? resolveFallback(look, fallbackTemplate) : undefined;
      if (fallback) return fallback;
      throw new Error(`ACTOR_TEMPLATE_UNKNOWN:${look.template}`);
    },
  };
}

/**
 * Returns the LOD tuple index selected by the full-detail budget. On high/ultra,
 * fullDetailSlotsUsed counts only already selected non-player LOD0 actors; one slot is reserved
 * for the player so actor iteration order cannot consume the guaranteed player slot.
 */
export function pickLod(
  role: ActorRole, tier: QualityTier, fullDetailSlotsUsed: number,
): 0 | 1 {
  if (tier === 'low') return 1;
  if (tier === 'mid') return role === 'player' ? 0 : 1;
  if (role === 'player') return 0;
  const nonPlayerLimit = tier === 'high' ? 2 : 5;
  return fullDetailSlotsUsed < nonPlayerLimit ? 0 : 1;
}
