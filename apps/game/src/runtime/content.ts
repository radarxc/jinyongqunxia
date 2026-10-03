import type { ChapterDef, ItemDef, MartialArtDef, NpcDef,
  RegionMap, TownRuntimeDefinition, WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import type { ContentIdRemap } from '@tianshu/data';
import type { EquipmentRule, EventAnchor, NpcWorldState, TownMeditationEncounter,
  TownMeditationPractice, InkStoryContent, RegionGateFacts, RegionGateBinding,
  RegionDialogueBinding, RegionLootBinding } from '@tianshu/core';
import type { BattleLaunch } from '../battle/contracts';

export interface MeridianTopology {
  readonly id: string; readonly name: string;
  readonly points: readonly { readonly id: string; readonly name: string }[];
}
export type GameItemDef = Omit<ItemDef, 'text'> & { readonly text?: ItemDef['text'] };
export interface GameContent {
  readonly items: readonly GameItemDef[]; readonly contentHash?: string;
  readonly chapters?: readonly ChapterDef[]; readonly idRemaps?: readonly ContentIdRemap[];
  readonly npcs: readonly NpcDef[];
  readonly skills: readonly MartialArtDef[]; readonly topology: readonly MeridianTopology[];
  readonly factions: Readonly<Record<string, string>>;
  readonly identityTags?: readonly string[];
  readonly assets?: Readonly<Record<string, { readonly icon?: string; readonly portrait?: string; readonly map?: string }>>;
  readonly equipmentRules?: readonly EquipmentRule[];
  readonly worldMaps?: readonly WorldMapRuntimeDefinition[];
  readonly towns?: readonly TownRuntimeDefinition[];
  readonly townEventAnchors?: readonly EventAnchor[];
  readonly townNpcWorld?: NpcWorldState;
  readonly townNpcPlacements?: readonly TownNpcPlacement[];
  readonly meditationPractice?: readonly TownMeditationPractice[];
  readonly meditationEncounters?: readonly GameTownMeditationEncounter[];
  /** Compiled Ink registry; the build plugin supplies this once CONTENT-ch00 is present. */
  readonly inkStories?: readonly InkStoryContent[];
  readonly regionMaps?: readonly RegionMap[];
  readonly regionGateFacts?: RegionGateFacts;
  readonly regionGates?: readonly RegionGateBinding[];
  readonly regionDialogues?: readonly RegionDialogueBinding[];
  readonly regionLoot?: readonly RegionLootBinding[];
}
export type StaticGameContent = Omit<GameContent, 'items' | 'contentHash'>;
export type TownLoader = (sceneId: string) => Promise<TownRuntimeDefinition | null>;
export interface TownNpcPlacement {
  readonly npcId: string; readonly sceneId: string; readonly eraLayer: string;
  readonly point: readonly [number, number]; readonly direction?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
export interface GameTownMeditationEncounter extends TownMeditationEncounter {
  readonly launch: Omit<BattleLaunch, 'setup'>;
}
export function equipmentRules(content: GameContent): readonly EquipmentRule[] {
  if (content.equipmentRules) return content.equipmentRules;
  return content.items.flatMap((item): EquipmentRule[] => {
    if (item.extension.type !== 'equipment') return [];
    const extension = item.extension.value;
    return [{ itemId: item.id, slot: extension.slot, uniqueEquipped: extension.uniqueEquipped,
      ...(extension.hands === undefined ? {} : { hands: extension.hands }),
      ...(extension.slot !== 'offHand' ? {} : { offHandRole: item.kind === 'hidden' || item.sub === 'pouch'
        ? 'hiddenCarrier' as const : item.sub === 'shield' ? 'shield' as const : 'secondaryWeapon' as const }),
    }];
  });
}
