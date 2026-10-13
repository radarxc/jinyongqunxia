import { buildEncounter, type GameState } from '@tianshu/core';
import type { CharacterTemplate, EncounterDef, RegionMap } from '@tianshu/data/schemas';
import type { BattleLaunch } from './contracts';
import { COMBAT_DEMO_ENCOUNTER, COMBAT_DEMO_MEDICINE, COMBAT_DEMO_MERIDIANS,
  COMBAT_DEMO_YANGQI, combatDemoSources, demoSeed } from './demo-seed';

const PROLOGUE_TEMPLATE: CharacterTemplate = {
  schemaVersion: 'character-template.v1',
  id: 'tmpl_normal',
  role: 'normal',
  innate: { con: 50, str: 50, agi: 50, wis: 50, wil: 50, luk: 50, cha: 50 },
  cultivationBand: { min: 1, max: 20, derived: true },
  skillSeeds: [],
};

export function createEncounterLaunch(
  encounter: EncounterDef,
  state: GameState,
  regionMaps: readonly RegionMap[] = [],
): BattleLaunch {
  const units = encounter.participants.map((participant) => {
    const sourceRef = participant.source.kind === 'npc'
      ? participant.source.npcId
      : participant.source.kind === 'character'
        ? participant.source.characterRef
        : participant.unitRef;
    const base = demoSeed(participant.unitRef);
    return { ref: sourceRef, seed: base };
  });

  const launch = buildEncounter(encounter, {
    setupId: `setup-${encounter.id}`,
    seed: state.chapter.clock?.elapsedTicks ?? 1,
    sourceSnapshotHash: '0'.repeat(64),
    sourceId: state.chapter.chapterId,
    triggerId: encounter.arena.kind === 'regionArena' ? encounter.arena.arenaId : encounter.id,
    worldTick: state.meta.worldTick,
    lossStreak: state.battle?.opening.setup.scriptContext?.lossStreak ?? 0,
    difficulty: state.profile.replayRules?.difficulty ?? 'diff_xiake',
    units,
    templates: [PROLOGUE_TEMPLATE],
    meridianInputs: encounter.participants.map((p) => ({
      ...(COMBAT_DEMO_MERIDIANS.find((m) => m.unitId === p.unitRef)
        ?? (p.side === 'player' ? COMBAT_DEMO_MERIDIANS[0]! : COMBAT_DEMO_MERIDIANS[1]!)),
      unitId: p.unitRef,
    })),
    regionMaps,
    inventory: state.party?.inventory?.stacks?.length
      ? { stacks: state.party.inventory.stacks.map(s => ({ itemId: s.itemId, count: s.count })) }
      : { stacks: [{ itemId: COMBAT_DEMO_MEDICINE.id, count: 2 }, { itemId: COMBAT_DEMO_YANGQI.id, count: 2 }] },
    itemDefs: [COMBAT_DEMO_MEDICINE, COMBAT_DEMO_YANGQI],
  });

  const cells = launch.setup.grid.cells.map((cell) => ({
    q: cell.q,
    r: cell.r,
    height: cell.height,
    terrain: 'tr_pingdi',
    label: '平地',
    color: 0xc8b994,
  }));

  const markers = launch.seeds.map((unit, index) => {
    const initial = launch.setup.start.initialByUnit.find((row) => row.unitRef === unit.id);
    const isHero = unit.id === 'hero';
    const isBaiyuan = unit.id === 'baiyuan';
    const isAqing = unit.id === 'aqing_projection';
    return {
      id: unit.id,
      index,
      name: isHero ? (state.profile.identity?.name ?? '越女剑客')
        : isBaiyuan ? '白猿'
        : isAqing ? '阿青（投影）'
        : unit.id.startsWith('road') ? '持剑路卒'
        : unit.id.startsWith('yue') ? '越国兵卒'
        : unit.id.startsWith('wu') ? '吴国剑士'
        : unit.id,
      appearance: isHero ? ({ kind: 'protagonist' } as const)
        : isBaiyuan ? ({ kind: 'npc', npcId: 'npc_baiyuan' } as const)
        : isAqing ? ({ kind: 'npc', npcId: 'npc_aqing' } as const)
        : ({ kind: 'template', templateId: 'tmpl_normal' } as const),
      q: initial?.pos.q ?? 0,
      r: initial?.pos.r ?? 0,
      height: 0,
      facing: initial?.facing ?? 0,
      active: true,
      qiNature: isHero ? ('neutral' as const) : ('yang' as const),
      equipment: isHero ? {
        mainHand: { id: 'it_bamboo_staff', tint: '#88a878' },
        body: { id: 'eq_buyi', tint: '#507879' },
      } : {},
    };
  });

  const title = encounter.id === 'enc_00_zhulin' ? '竹林初阵'
    : encounter.id === 'enc_00_baiyuan' ? '猿跃试手'
    : encounter.id === 'enc_00_biandao' ? '边道止争'
    : '战斗';

  return {
    ...launch,
    title,
    preview: false,
    cells,
    markers,
    moves: DEMO_MOVES,
  };
}

export const DEMO_MOVES = [
  {
    id: 'mv_basic_strike',
    name: '普通一击',
    skillId: 'sk_basic',
    skillName: '基本功',
    shape: { tpl: 'aoe_single' as const },
    range: 1,
  },
  {
    id: 'mv_yuenv_fuliu',
    name: '越女拂柳',
    skillId: 'sk_yuenvjian',
    skillName: '越女剑法',
    shape: { tpl: 'aoe_single' as const },
    range: 2,
  },
  {
    id: 'mv_yuenv_liuxing',
    name: '流星白羽',
    skillId: 'sk_yuenvjian',
    skillName: '越女剑法',
    shape: { tpl: 'aoe_line' as const, n: 3 },
    range: 3,
  },
  {
    id: 'mv_yuenv_jianqi',
    name: '剑气横秋',
    skillId: 'sk_yuenvjian',
    skillName: '越女剑法',
    shape: { tpl: 'aoe_cone' as const, r: 2, angle: 60 as const, dirCount: 6 as const },
    range: 2,
  },
  {
    id: 'mv_anqi_feishi',
    name: '暗器·飞石投掷',
    skillId: 'sk_anqi',
    skillName: '暗器手法',
    shape: { tpl: 'aoe_single' as const },
    range: 4,
  },
  {
    id: 'mv_anqi_mantianhuayu',
    name: '暗器·漫天花雨',
    skillId: 'sk_anqi',
    skillName: '暗器手法',
    shape: { tpl: 'aoe_cone' as const, r: 2, angle: 60 as const, dirCount: 6 as const },
    range: 3,
  },
];

/** Presentation now opens through encounter.v1 instead of authoring BattleSetup units in app code. */
export function createBattleDemo(source: 'world' | 'town'): BattleLaunch {
  const launch = buildEncounter(COMBAT_DEMO_ENCOUNTER, { setupId: 'setup-fixture', seed: 0,
    sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture', worldTick: 0,
    difficulty: 'diff_xiake', units: combatDemoSources(), templates: [], sceneRef: source,
    meridianInputs: COMBAT_DEMO_MERIDIANS, inventory: { stacks: [
      { itemId: COMBAT_DEMO_MEDICINE.id, count: 2 },
      { itemId: COMBAT_DEMO_YANGQI.id, count: 2 },
    ] }, itemDefs: [COMBAT_DEMO_MEDICINE, COMBAT_DEMO_YANGQI] });
  const cells = launch.setup.grid.cells.map((cell) => ({ q: cell.q, r: cell.r, height: cell.height,
    terrain: 'tr_pingdi', label: '平地', color: 0xc8b994 }));
  return { ...launch, title: '演武场', preview: true, cells,
    markers: launch.seeds.map((unit, index) => {
      const initial = launch.setup.start.initialByUnit.find((row) => row.unitRef === unit.id)!;
      return { id: unit.id, index, name: unit.id === 'hero' ? '演武侠客' : '陪练',
        appearance: unit.id === 'hero' ? { kind: 'protagonist' as const }
          : { kind: 'template' as const, templateId: 'tmpl_normal' },
        q: initial.pos.q, r: initial.pos.r, height: 0, facing: initial.facing, active: true,
        qiNature: unit.id === 'hero' ? 'neutral' : 'yang',
        equipment: unit.id === 'hero' ? { mainHand: { id: 'eq_qinggangjian', tint: '#a9b9c1' },
          body: { id: 'eq_buyi', tint: '#507879' } } : {} };
    }),
    moves: DEMO_MOVES,
  };
}
