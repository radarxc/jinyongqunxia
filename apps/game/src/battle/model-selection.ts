import type { BattleModelCatalog, BattleModelVisual } from '@tianshu/render/battle';
import type { BattleLaunch, BattleLaunchMarker, BattleModelSource } from './contracts';
import type { GameContent } from '../runtime/content';

function gender(value: string | undefined): 'male' | 'female' {
  return value === 'female' ? 'female' : 'male';
}

const FALLBACK_PROTAGONIST: BattleModelVisual = {
  key: 'npc_zhujue__ch00_m', kind: 'dedicated', gender: 'male', heightM: 1.70,
  modelUrl: '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb',
  animationUrl: '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb',
};
const FALLBACK_GENERIC: BattleModelVisual = {
  key: 'npc_generic_m', kind: 'generic', gender: 'male', heightM: 1.70,
  modelUrl: '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb',
  animationUrl: '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb',
};

export function resolveMarkerModel(catalog: BattleModelCatalog | undefined,
  content: Pick<GameContent, 'npcs'>, source: BattleModelSource,
  protagonistGender?: string): BattleModelVisual | null {
  if (!catalog) {
    if (source.kind === 'protagonist') return FALLBACK_PROTAGONIST;
    return FALLBACK_GENERIC;
  }
  if (source.kind === 'protagonist')
    return catalog.protagonist[gender(protagonistGender)] ?? FALLBACK_PROTAGONIST;
  if (source.kind === 'template')
    return catalog.templates[source.templateId] ?? catalog.generic.male ?? FALLBACK_GENERIC;
  const npc = content.npcs.find(row => row.id === source.npcId);
  if (npc?.identity.species !== 'human') return null;
  return catalog.npcs[source.npcId] ?? catalog.generic[gender(npc?.identity.gender)] ?? FALLBACK_GENERIC;
}

function inferredSource(marker: BattleLaunchMarker, content: Pick<GameContent, 'npcs'>,
  protagonistId?: string): BattleModelSource {
  if (marker.appearance) return marker.appearance;
  if (['hero', 'npc_zhujue', protagonistId].includes(marker.id)) return { kind: 'protagonist' };
  const exact = content.npcs.find(npc => npc.id === marker.id) ?? [...content.npcs]
    .sort((left, right) => right.id.length - left.id.length)
    .find(npc => {
      const alias = npc.id.startsWith('npc_') ? npc.id.slice(4) : npc.id;
      return marker.id === alias || marker.id.startsWith(`${alias}_`);
    });
  if (exact) return { kind: 'npc', npcId: exact.id };
  return { kind: 'template', templateId: 'tmpl_normal' };
}

/** Adds presentation data without changing the deterministic battle setup or seeds. */
export function withBattleModels(launch: BattleLaunch, content: GameContent, options: {
  readonly protagonistId?: string; readonly protagonistGender?: string;
} = {}): BattleLaunch {
  return { ...launch, markers: launch.markers.map(marker => {
    const appearance = inferredSource(marker, content, options.protagonistId);
    const portraitUrl = appearance.kind === 'npc'
      ? content.assets?.[appearance.npcId]?.portrait : undefined;
    return { ...marker, appearance, model: resolveMarkerModel(content.battleModels, content,
      appearance, options.protagonistGender),
      ...(portraitUrl ? { portraitUrl } : {}) };
  }) };
}
