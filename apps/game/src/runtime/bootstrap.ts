import { createCharacterState, createCore, createInitialWorldMapState, InventoryRuntime,
  worldMapLocation, type CharacterState, type SkillState } from '@tianshu/core';
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
    innate: { con: 50, str: 50, agi: 50, wis: 50, wil: 50, luk: 50, cha: 50 },
    skills, meridians: emptyMeridians(), legacyHpCredit: 0, legacyMpCredit: 0,
  }, skills.map((skill) => ({ skillId: skill.skillId, absGrade: skill.sourceGrade,
    trueLayer: skill.trueLayer, category: content.skills.find((row) => row.id === skill.skillId)?.category === 'inner' ? 'inner' : 'other' })));
}

/** Interaction fixture only; never claims to be a story reward or canonical opening. */
export function createPreviewSession(content: GameContent): SessionSnapshot {
  const state = createCore(1).snapshot();
  const protagonist = character('npc_zhujue', content, [{ skillId: 'sk_taizuchangquan', trueLayer: 1 }]);
  const duanyu = content.npcs.find((npc) => npc.id === 'npc_duanyu');
  const build = duanyu?.appearances[0]?.build;
  const inventory = new InventoryRuntime({ stacks: content.items.map((item) => ({
    itemId: item.id, count: item.extension.type === 'equipment' ? 1 : Math.min(3, item.stack),
  })) }, content.items).snapshot();
  const map = content.worldMaps?.find((entry) => entry.chapterId === state.chapter.chapterId) ?? null;
  const worldMap = map ? createInitialWorldMapState(map) : null;
  return { schema: 'ui-session.v1', preview: true,
    location: map && worldMap ? `${worldMapLocation(worldMap, map)} · 大地图` : '大理 · 歇脚处',
    state: { ...state, profile: { protagonist, companions: [] },
      party: { ...state.party, inventory }, chapter: { ...state.chapter, worldMap } },
    known: [
      { npcId: 'npc_duanyu', relationship: 'befriended', affinity: 0,
        character: build?.pipeline === 'full' ? character('npc_duanyu', content, build.skills) : null },
      { npcId: 'npc_zhongling', relationship: 'met', affinity: 0, character: null },
    ], usage: { battleUses: {}, chapterUses: {} }, itemTargets: {},
  };
}
