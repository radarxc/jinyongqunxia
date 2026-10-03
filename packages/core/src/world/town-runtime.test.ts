import { describe, expect, it } from 'vitest';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import { createCore } from '../api';
import type { ConsumableTargetState } from '../economy';
import { createMeditationState } from '../progression';
import { createRng, seedStream } from '../rng';
import { createGameClock, type CharacterState } from '../state';
import { completeTownMeditation, createTownRuntime, deriveMeditationRisk, dispatchTownCommand, enterTownBuilding, exitTownBuilding, meditationAmbushChanceBp,
  resolveMeditationAmbush, resolveTownMeditation, settleTownBuildingFade, TownPathfinder,
  type TownSessionState } from './town-runtime';

function town(): TownRuntimeDefinition {
  return { schemaVersion: 'town-runtime.v1', revision: '0'.repeat(64), cityId: 'city_test',
    chapterId: 'ch01', sceneId: 'city_test', displayName: '测试镇', historicalYear: 1093,
    eraKit: 'song_dali', source: { spec: 'spec', layout: 'layout', sha256: '1'.repeat(64) },
    grid: { width: 2, height: 2, cellM: 1, chunkCells: 32 },
    projection: { tilePx: [64, 32], pitchDeg: 30, yawDeg: 45, elevationCmPerM: 100 },
    assets: { tile: { baseUrl: '/', manifest: 'tile', entries: [] },
      building: { baseUrl: '/', manifest: 'building', entries: [] } },
    groundPalette: [{ ground: 'earth', overlay: null, elevationCm: 0, walkable: true }],
    groundRuns: [[0, 4, 0]], edgeTiles: [], waterRuns: [], bridgeRuns: [],
    navigation: { neighborOrder: 'axial-rq-v1', maxStepCm: 50,
      nodes: [[0, 0, 0, 'flat'], [1, 0, 25, 'ramp'], [2, 0, 25, 'flat'],
        [0, 1, 0, 'flat'], [1, 1, 100, 'stairs']], spawn: [0, 0] },
    buildings: [{ id: 'bi_0001', type: 'bld_shop', origin: [1, 1], size: [1, 1],
      rotationDeg: 0, entrances: [[2, 0]], businessRef: 'shop_test', poi: null,
      enterable: true, interiorKind: 'shop', assetId: 'bld_shop' }],
    anchors: [{ id: 'anchor_meditation_test', kind: 'meditation', point: [0, 1],
      buildingId: null, ref: null, riskBaseBp: 250 }],
  };
}
const outside = (point: readonly [number, number]): TownSessionState =>
  ({ version: 1, townRevision: '0'.repeat(64), sceneId: 'city_test',
    point, buildingId: null, buildingPhase: 'outside' });

describe('town integer runtime', () => {
  it('finds a stable axial path, allows marked ramps, and rejects cliffs or blocked cells', () => {
    const pathfinder = new TownPathfinder(town());
    expect(pathfinder.find([0, 0], [2, 0])?.points).toEqual([[0, 0], [1, 0], [2, 0]]);
    expect(pathfinder.canStep([0, 0], [1, 0])).toBe(true);
    expect(pathfinder.canStep([0, 1], [1, 1])).toBe(false);
    expect(pathfinder.find([0, 0], [9, 9])).toBeNull();
  });

  it('runs the direct-entry fade state machine without changing scene', () => {
    const building = town().buildings[0]!;
    const entering = enterTownBuilding(outside([2, 0]), building);
    expect(entering).toEqual({ ...outside([2, 0]), buildingId: 'bi_0001', buildingPhase: 'fading-in' });
    const inside = settleTownBuildingFade(entering);
    expect(dispatchTownCommand({ town: town() }, inside, { t: 'town/interact' }))
      .toMatchObject({ action: 'shop', ref: 'shop_test' });
    expect(settleTownBuildingFade(exitTownBuilding(inside))).toEqual(outside([2, 0]));
  });

  it('does not open an unregistered generic shop interior', () => {
    const definition = town(); const building = { ...definition.buildings[0]!, businessRef: null };
    const inside = settleTownBuildingFade(enterTownBuilding(outside([2, 0]), building));
    expect(() => dispatchTownCommand({ town: { ...definition, buildings: [building] } },
      inside, { t: 'town/interact' })).toThrow('TOWN_NOT_AT_SHOP');
  });

  it('automatically enters at a building door and persists its lookup indexes', () => {
    const runtime = createTownRuntime({ town: town() });
    const entering = runtime.dispatch(outside([0, 0]), { t: 'town/move', destination: [2, 0] });
    expect(entering.state).toMatchObject({ buildingId: 'bi_0001', buildingPhase: 'fading-in' });
    const inside = runtime.dispatch(entering.state, { t: 'town/settle-building' }).state;
    expect(inside.buildingPhase).toBe('inside');
    const leaving = runtime.dispatch(inside, { t: 'town/exit-building' }).state;
    expect(runtime.dispatch(leaving, { t: 'town/settle-building' }).state).toEqual(outside([2, 0]));
  });

  it('requires an indoor meditation anchor to be inside its owning building', () => {
    const definition = town(); const building = definition.buildings[0]!;
    const anchor = { ...definition.anchors[0]!, point: building.entrances[0]!,
      buildingId: building.id };
    const runtime = createTownRuntime({ town: { ...definition, anchors: [anchor] } });
    const atDoor = outside(building.entrances[0]!);
    expect(() => runtime.dispatch(atDoor, { t: 'town/meditate',
      anchorId: anchor.id, plannedTicks: 600 })).toThrow('TOWN_MEDITATION_UNAVAILABLE');
    const inside = settleTownBuildingFade(enterTownBuilding(atDoor, building));
    expect(runtime.dispatch(inside, { t: 'town/meditate', anchorId: anchor.id,
      plannedTicks: 600 }).action).toBe('meditate');
  });

  it('selects the lowest building ID when authored entrances overlap', () => {
    const definition = town(); const original = definition.buildings[0]!;
    const duplicate = { ...original, id: 'bi_0002', businessRef: 'shop_other' };
    const runtime = createTownRuntime({ town: { ...definition, buildings: [duplicate, original] } });
    expect(runtime.dispatch(outside([0, 0]), { t: 'town/move', destination: [2, 0] }).state)
      .toMatchObject({ buildingId: 'bi_0001' });
    expect(runtime.dispatch(outside([0, 0]), { t: 'town/move', destination: [2, 0],
      buildingId: 'bi_0002' }).state).toMatchObject({ buildingId: 'bi_0002' });
    expect(() => runtime.dispatch(outside([0, 0]), { t: 'town/move', destination: [2, 0],
      buildingId: 'bi_9999' })).toThrow('TOWN_BUILDING_ENTRY');
  });

  it('rejects session state from another scene or content revision', () => {
    const runtime = createTownRuntime({ town: town() });
    expect(() => runtime.dispatch({ ...outside([0, 0]), sceneId: 'city_other' },
      { t: 'town/move', destination: [1, 0] })).toThrow('TOWN_STATE_MISMATCH');
    expect(() => runtime.dispatch({ ...outside([0, 0]), townRevision: '1'.repeat(64) },
      { t: 'town/move', destination: [1, 0] })).toThrow('TOWN_STATE_MISMATCH');
  });

  it('resolves location and era-filtered NPC anchors into dialogue commands', () => {
    const anchors = [
      { id: 'anchor_location', kind: 'location' as const, sceneId: 'city_test', trigger: 'enter' as const,
        lineId: 'side', nodeId: 'arrive', point: { q: 1, r: 0 } },
      { id: 'anchor_npc', kind: 'npc' as const, sceneId: 'city_test', trigger: 'interact' as const,
        lineId: 'main', nodeId: 'talk', npcId: 'npc_test' },
    ];
    expect(dispatchTownCommand({ town: town(), eventAnchors: anchors }, outside([0, 0]),
      { t: 'town/move', destination: [1, 0] }).anchors).toEqual([{ lineId: 'side', nodeId: 'arrive' }]);
    const npcWorld = { presences: [{ npcId: 'npc_test', eraLayer: 'ch01', sceneId: 'city_test',
      anchor: 'door', sourceLineId: 'main', sourceNodeId: 'talk' }], relationships: [] };
    const npcAnchors = [{ npcId: 'npc_test', sceneId: 'city_test', eraLayer: 'ch01',
      point: [0, 0] as const }];
    expect(dispatchTownCommand({ town: town(), eventAnchors: anchors, npcWorld, npcAnchors, eraLayer: 'ch01' },
      outside([0, 0]), { t: 'town/interact', npcId: 'npc_test' }).action).toBe('dialogue');
    expect(() => dispatchTownCommand({ town: town(), eventAnchors: anchors, npcWorld, npcAnchors, eraLayer: 'ch01' },
      outside([1, 0]), { t: 'town/interact', npcId: 'npc_test' })).toThrow('TOWN_NPC_NOT_HERE');
    expect(() => dispatchTownCommand({ town: town(), eventAnchors: anchors, npcWorld, npcAnchors, eraLayer: 'ch02' },
      outside([0, 0]), { t: 'town/interact', npcId: 'npc_test' })).toThrow('TOWN_NPC_ABSENT');
  });
});

const participants = [
  { unitRef: 'npc_zhujue', side: 'player' as const, control: 'player' as const,
    spawn: 'player', state: 'active' as const, required: true },
  { unitRef: 'npc_attacker', side: 'enemy' as const, control: 'ai' as const,
    spawn: 'enemy', state: 'active' as const, required: true },
];
const meditationCommand = { t: 'town/meditate' as const,
  anchorId: 'anchor_meditation_test', plannedTicks: 600 };
const encounter = { sceneId: 'city_test', anchorId: 'anchor_meditation_test',
  attackerId: 'npc_attacker', setup: { encounterId: 'enc_town_meditation_ambush' as const,
    setupId: 'town-ambush-40', seed: 9, sourceSnapshotHash: '0'.repeat(64),
    participants, meditationUnitRefs: ['npc_zhujue'] } };
function meditationGame(seed = 7) {
  const base = createCore(seed).snapshot();
  const clock = createGameClock('epoch_test', 1093, 600);
  const character: CharacterState = { characterId: 'npc_zhujue', status: 'active',
    innate: { con: 1, str: 1, bre: 1, agi: 1, wis: 1, wil: 1, luk: 1, cha: 1 },
    skills: [], meridians: { schemaVersion: 2, opened: ['ap_test'],
      meridianStats: { mer_test: { grade: 6, strengthLayer: 3, strengthXp: 0, fluxCap: 16 } },
      acupointStats: { ap_test: { grade: 6, strengthLayer: 3, strengthXp: 0, fluxCap: 16 } },
      targets: {}, turnCompleted: 0, lastAppliedMigration: 0 },
    legacyHpCredit: 0, legacyMpCredit: 0,
    stats: { hpMax: 301, mpMax: 201, strength: 1, speed: 1, tenacity: 1, coordination: 1 },
    resources: { hp: 1, mp: 2 }, consumable: { stamina: 3, staminaMax: 11, ailments: [],
      temporaryEffects: [], permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 },
      meridianAids: [] } };
  return { ...base, meta: { ...base.meta, worldTick: clock.elapsedTicks },
    profile: { ...base.profile, protagonist: character, companions: [] },
    chapter: { ...base.chapter, clock, worldYear: 1093, town: outside([0, 1]) } };
}
function meditationTarget(character: CharacterState): ConsumableTargetState {
  return { characterId: character.characterId, alive: true, hp: character.resources.hp,
    hpMax: character.stats.hpMax, mp: character.resources.mp, mpMax: character.stats.mpMax,
    stamina: 3, staminaMax: 11, ailments: [], temporaryEffects: [],
    permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 }, meridianAids: [],
    meridians: character.meridians };
}

describe('town meditation ambush', () => {
  it('owns safe completion and skips the RNG when no encounter is authored', () => {
    const game = meditationGame(); const rng = game.meta.rng.world;
    const result = resolveTownMeditation({ game, town: town(), command: meditationCommand,
      itemTargets: { npc_zhujue: meditationTarget(game.profile.protagonist!) },
      npcWorld: { presences: [], relationships: [] }, eraLayer: 'ch01', practices: [{
        sceneId: 'city_test', anchorId: 'anchor_meditation_test', input: {
        cycleTicks: 600, fluxTrainBase: 6, effectiveLayer: 5, rateH: 100,
        meridianIds: ['mer_test'], acupointIds: ['ap_test'] } }] });
    expect(result.game.meta.rng.world).toEqual(rng);
    expect(result.game.meta.worldTick).toBe(1_200);
    expect(result.game.chapter.clock.elapsedTicks).toBe(1_200);
    expect(result.game.profile.protagonist?.resources).toEqual({ hp: 151, mp: 201 });
    expect(result.game.profile.protagonist?.meridians.meridianStats['mer_test']?.fluxCap).toBe(20);
    expect(result.target).toMatchObject({ hp: 151, mp: 201, stamina: 11,
      meridians: result.game.profile.protagonist?.meridians });
    expect(result.battleSetup).toBeNull();
    expect(result.events.map((event) => event.t)).toContain('town/meditationCompleted');
  });

  it('derives hostility by era and scene and atomically returns an ambush transaction', () => {
    const game = meditationGame(19); const npcWorld = {
      presences: [{ npcId: 'npc_attacker', eraLayer: 'ch01', sceneId: 'city_test',
        anchor: 'gate', sourceLineId: 'main', sourceNodeId: 'wait' },
      { npcId: 'npc_other', eraLayer: 'ch02', sceneId: 'city_other',
        anchor: 'gate', sourceLineId: 'side', sourceNodeId: 'wait' }],
      relationships: [{ npcId: 'npc_attacker', affinity: -10, bond: 0, resentment: 1 },
        { npcId: 'npc_other', affinity: -100, bond: 0, resentment: 100 }],
    };
    const input = { game, town: town(), command: meditationCommand, npcWorld, eraLayer: 'ch01',
      encounters: [{ ...encounter, setup: { ...encounter.setup, seed: 7 } }] };
    const first = resolveTownMeditation(input); const second = resolveTownMeditation(input);
    expect(first).toEqual(second); expect(first.battleSetup?.entry).toMatchObject({
      kind: 'meditationAmbush', triggerId: 'npc_attacker', worldTick: 600 });
    expect(first.game.meta.rng.world).not.toEqual(game.meta.rng.world);
    expect(first.game.chapter.clock).toBe(game.chapter.clock);
    expect(first.game.profile.protagonist).toBe(game.profile.protagonist);
    expect(first.events.map((event) => event.t)).toEqual(['progression/meditationInterrupted']);
  });

  it('ignores hostile NPCs outside the current era and scene, then completes on a miss', () => {
    const game = meditationGame(15);
    const result = resolveTownMeditation({ game, town: town(), command: meditationCommand,
      encounters: [{ ...encounter, setup: { ...encounter.setup, seed: 15 } }], npcWorld: {
        presences: [{ npcId: 'npc_other', eraLayer: 'ch02', sceneId: 'city_other',
          anchor: 'gate', sourceLineId: 'side', sourceNodeId: 'wait' }],
        relationships: [{ npcId: 'npc_other', affinity: -100, bond: 0, resentment: 100 }],
      }, eraLayer: 'ch01' });
    expect(result.battleSetup).toBeNull();
    expect(result.game.meta.rng.world).not.toEqual(game.meta.rng.world);
    expect(result.game.meta.worldTick).toBe(1_200);
  });

  it('rejects invalid completion without mutating the supplied game or RNG state', () => {
    const game = meditationGame(); const frozen = structuredClone(game);
    expect(() => resolveTownMeditation({ game, town: town(),
      command: { ...meditationCommand, plannedTicks: 599 },
      encounters: [encounter], npcWorld: { presences: [], relationships: [] }, eraLayer: 'ch01' }))
      .toThrow('TOWN_MEDITATION_UNAVAILABLE');
    expect(game).toEqual(frozen);
  });

  it('rolls back when BattleSetup construction rejects after the risk roll', () => {
    const game = meditationGame(); const frozen = structuredClone(game);
    const definition = town(); const forced = { ...definition, anchors: definition.anchors.map((anchor) =>
      anchor.id === meditationCommand.anchorId ? { ...anchor, riskBaseBp: 10_000 } : anchor) };
    expect(() => resolveTownMeditation({ game, town: forced, command: meditationCommand,
      encounters: [{ ...encounter, setup: { ...encounter.setup, participants: [] } }],
      npcWorld: { presences: [], relationships: [] }, eraLayer: 'ch01' }))
      .toThrow('BATTLE_SETUP_PARTICIPANTS');
    expect(game).toEqual(frozen);
  });

  it('advances one hour and restores resources with integer rounding', () => {
    const character: CharacterState = { characterId: 'npc_zhujue', status: 'active',
      innate: { con: 1, str: 1, bre: 1, agi: 1, wis: 1, wil: 1, luk: 1, cha: 1 },
      skills: [], meridians: { schemaVersion: 2, opened: [], meridianStats: {},
        acupointStats: {}, targets: {}, turnCompleted: 0, lastAppliedMigration: 0 },
      legacyHpCredit: 0, legacyMpCredit: 0,
      stats: { hpMax: 301, mpMax: 201, strength: 1, speed: 1, tenacity: 1, coordination: 1 },
      resources: { hp: 1, mp: 2 }, consumable: { stamina: 3, staminaMax: 11, ailments: [],
        temporaryEffects: [], permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 },
        meridianAids: [] } };
    const result = completeTownMeditation({ clock: createGameClock('epoch_test', 1093),
      character, plannedTicks: 600, stamina: { current: 3, maximum: 11 } });
    expect(result.clock.elapsedTicks).toBe(600);
    expect(result.character.resources).toEqual({ hp: 151, mp: 201 });
    expect(result.stamina).toBe(11); expect(result.events).toHaveLength(1);
    expect(() => completeTownMeditation({ clock: result.clock, character, plannedTicks: 599 }))
      .toThrow('TOWN_MEDITATION_TICKS');
  });

  it('combines basis-point factors and clamps them before consuming RNG', () => {
    expect(meditationAmbushChanceBp({ baseBp: 250, timeBp: 300, wantedBp: 500,
      hostileBp: 1_000 })).toBe(2_050);
    expect(meditationAmbushChanceBp({ baseBp: 9_000, timeBp: 2_000, wantedBp: 0,
      hostileBp: 0 })).toBe(10_000);
    expect(() => meditationAmbushChanceBp({ baseBp: -1, timeBp: 0, wantedBp: 0,
      hostileBp: 0 })).toThrow('TOWN_AMBUSH_RISK');
    expect(deriveMeditationRisk({ baseBp: 250, slotInDay: 10, wantedLevel: 2,
      hostileNpcCount: 3 })).toEqual({ baseBp: 250, timeBp: 300, wantedBp: 1_000, hostileBp: 3_000 });
  });

  it('is replay deterministic and emits an enemy-first BattleSetup with qi deviation', () => {
    const resolve = () => resolveMeditationAmbush({ rng: createRng(seedStream(7, 'world')),
      risk: { baseBp: 10_000, timeBp: 0, wantedBp: 0, hostileBp: 0 },
      meditation: createMeditationState('meditation-1', 1_200), causeId: 'npc_attacker',
      worldTick: 40, encounterId: 'enc_town_meditation_ambush', setupId: 'town-ambush-40', seed: 9,
      sourceSnapshotHash: '0'.repeat(64), sceneId: 'city_test', anchorId: 'anchor_meditation_test',
      participants, meditationUnitRefs: ['npc_zhujue'] });
    const first = resolve(); const second = resolve();
    expect(first).toEqual(second); expect(first.ambushed).toBe(true);
    if (!first.ambushed) throw new Error('test invariant');
    expect(first.meditation.status).toBe('interrupted');
    expect(first.setup.start.initiativeSide).toBe('enemy');
    expect(first.setup.start.initialEffects).toEqual([{ unitRef: 'npc_zhujue', buffRef: 'bf_chaqi',
      stacks: 1, remainingOwnActions: 3, cause: 'npc_attacker' }]);
  });

  it('does not interrupt or build a battle when the deterministic roll misses', () => {
    const meditation = createMeditationState('meditation-2', 600);
    const result = resolveMeditationAmbush({ rng: createRng(seedStream(8, 'world')),
      risk: { baseBp: 0, timeBp: 0, wantedBp: 0, hostileBp: 0 }, meditation,
      causeId: 'npc_attacker', worldTick: 50, encounterId: 'enc_town_meditation_ambush',
      setupId: 'town-ambush-50', seed: 10, sourceSnapshotHash: '0'.repeat(64),
      sceneId: 'city_test', anchorId: 'anchor_meditation_test', participants,
      meditationUnitRefs: ['npc_zhujue'] });
    expect(result).toEqual({ ambushed: false, meditation, setup: null });
  });
});
