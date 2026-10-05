import { RNG_PROTOCOL, RNG_STREAMS, createCharacterState,
  createInitialGameState, seedStream, type CharacterState, type RngStreamName,
  type SkillState } from '@tianshu/core/state';
import { createInitialWorldMapState } from '@tianshu/core/projection';
import { InventoryRuntime } from '@tianshu/core/inventory-runtime';
import { CORE_BUILD, CORE_VERSION } from './core-version';
import type { GameContent } from './content';
import type { SessionSnapshot } from './contracts';

const emptyMeridians = () => ({ schemaVersion: 2 as const, opened: [], meridianStats: {},
  acupointStats: {}, targets: {}, turnCompleted: 0, lastAppliedMigration: 0 });
function character(id: string, content: GameContent, learning: readonly { skillId: string; trueLayer: number }[]): CharacterState {
  const skills: SkillState[] = learning.flatMap((entry) => {
    const definition = content.skills.find((skill) => skill.id === entry.skillId);
    if (!definition) return [];
    return [{ skillId: definition.id, sourceGrade: definition.grade, sourceCap: 10, trueLayer: entry.trueLayer,
      sxp: 0, learnedIn: 'ch01_tianlong', nativeTo: 'ch01_tianlong', attunedGrade: null,
      attunedIn: null, latentExp: 0, movesEquipped: [], insight: 0, pages: [], flags: [] }];
  });
  return createCharacterState({ characterId: id, status: 'active',
    innate: { con: 50, str: 50, bre: 50, agi: 50, wis: 50, wil: 50, luk: 50, cha: 50 },
    skills, meridians: emptyMeridians(), legacyHpCredit: 0, legacyMpCredit: 0,
  }, skills.map((skill) => ({ skillId: skill.skillId, absGrade: skill.sourceGrade,
    trueLayer: skill.trueLayer, category: content.skills.find((row) => row.id === skill.skillId)?.category === 'inner' ? 'inner' : 'other' })));
}

/** Interaction fixture only; never claims to be a story reward or canonical opening. */
export function createPreviewSession(content: GameContent,
  chapterId: 'ch01_tianlong' | 'ch10_baima' = 'ch01_tianlong'): SessionSnapshot {
  const tianlong = chapterId === 'ch01_tianlong';
  const rng = Object.fromEntries(RNG_STREAMS.map((stream) =>
    [stream, seedStream(1, stream)])) as Record<RngStreamName, ReturnType<typeof seedStream>>;
  const state = createInitialGameState({ coreVersion: CORE_VERSION,
    coreBuild: CORE_BUILD, chapterId, epochId: tianlong ? 'epoch_ch01' : 'epoch_ch10',
    epochYear: tianlong ? 1093 : 702, rngProtocol: RNG_PROTOCOL, masterSeed: 1, rng });
  const versioned = content.contentHash ? { ...state, meta: { ...state.meta,
    contentHash: content.contentHash } } : state;
  const protagonist = character('npc_zhujue', content, [{ skillId: 'sk_taizuchangquan', trueLayer: 1 }]);
  const featuredId = tianlong ? 'npc_duanyu' : 'npc_liwenxiu';
  const build = content.npcs.find((npc) => npc.id === featuredId)?.appearances[0]?.build;
  const inventory = new InventoryRuntime({ stacks: content.items.map((item) => ({
    itemId: item.id, count: item.extension.type === 'equipment' ? 1 : Math.min(3, item.stack),
  })) }, content.items).snapshot();
  const map = content.worldMaps?.find((entry) => entry.chapterId === versioned.chapter.chapterId) ?? null;
  const worldMap = map ? createInitialWorldMapState(map) : null;
  return { ...versioned, meta: { ...versioned.meta, debugTainted: true },
    profile: { ...versioned.profile, protagonist, companions: [] }, party: { ...state.party, inventory },
    world: { ...versioned.world, navigation: { ...versioned.world.navigation,
      locationId: worldMap?.position.kind === 'node' ? worldMap.position.nodeId :
        tianlong ? 'city_dali' : 'sc_10_fengshi_feiyi' } },
    chapter: { ...versioned.chapter, worldMap, town: null, npcs: [
      { npcId: featuredId, relationship: 'befriended', affinity: 0,
        character: build?.pipeline === 'full' ? character(featuredId, content, build.skills) : null },
      { npcId: tianlong ? 'npc_zhongling' : 'npc_postman_tang_xiyu',
        relationship: 'met', affinity: 0, character: null },
    ], itemChapterUses: {} },
  };
}
