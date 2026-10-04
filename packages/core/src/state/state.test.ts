import { describe, expect, it } from 'vitest';
import type { JsonValue } from '@tianshu/shared';
import { createBattleSession } from '../battle';
import { RNG_PROTOCOL, seedStream, type RngStreamName } from '../rng';
import { battleSeed, combatFixture } from '../testing/combat-fixture';
import {
  advanceBattle, advanceGameClock, advanceInnRest, advanceMeditation, advanceTravel,
  createEmptyEquipment, createGameClock, createInitialGameState, parseGameState,
  migrateBookSleepV2, migrateUiSessionV1, RULES_PROTOCOL, SAVE_SCHEMA,
  TICKS_PER_DAY, TICKS_PER_HOUR,
} from '.';

function initialState() {
  const names: readonly RngStreamName[] = ['battle', 'loot', 'world', 'ai', 'qiyu'];
  return createInitialGameState({
    coreVersion: 'test',
    chapterId: 'ch01_tianlong',
    epochId: 'epoch_ch01',
    epochYear: 1093,
    rngProtocol: RNG_PROTOCOL,
    rng: Object.fromEntries(names.map((name) => [name, seedStream(1, name)])) as ReturnType<typeof createInitialGameState>['meta']['rng'],
  });
}

describe('GameState JSON boundary', () => {
  it('accepts a JSON round trip and rejects non-JSON object families', () => {
    const state = initialState();
    expect(parseGameState(JSON.parse(JSON.stringify(state)))).toEqual(state);
    for (const invalid of [new Map(), new Set(), new Uint8Array([1])]) {
      expect(() => parseGameState({ ...state, profile: invalid })).toThrow('STATE_NOT_JSON');
    }
  });

  it('rejects malformed nested state instead of trusting a root-shaped object', () => {
    const state = initialState();
    expect(() => parseGameState({ ...state, party: {} })).toThrow('STATE_SHAPE');
    const metaWithoutProtocol = Object.fromEntries(
      Object.entries(state.meta).filter(([key]) => key !== 'rngProtocol'),
    );
    expect(() => parseGameState({ ...state, meta: metaWithoutProtocol })).toThrow('STATE_SHAPE');
  });

  it('preserves schema-3 bytes before the first receipt and rejects malformed sessions', () => {
    const state = initialState();
    const legacyWorld = Object.fromEntries(Object.entries(state.world)
      .filter(([key]) => key !== 'battleReceipts'));
    expect(parseGameState({ ...state, world: legacyWorld }).world).toEqual(legacyWorld);
    const battle = combatFixture();
    const session = createBattleSession(battle.setup, battle.units.map((unit) =>
      battleSeed(unit.id, unit.moves)));
    expect(parseGameState({ ...state, battle: session }).battle).toEqual(session);
    expect(() => parseGameState({ ...state, battle: { ...session, battleId: '' } }))
      .toThrow('STATE_SHAPE');
    expect(() => parseGameState({ ...state, battle: { ...session, battle: {
      ...session.battle, phase: 'ended', result: null,
    } } }))
      .toThrow('STATE_SHAPE');
  });

  it('rejects unknown dynamic terrain IDs in a mounted region', () => {
    const state = initialState();
    const mountedRegion = { regionId: 'rg_fixture', spawnId: 'entry',
      playerHex: { q: 0, r: 0 }, facing: 0,
      dynamicTiles: [{ q: 0, r: 0, terrainId: 'tr_not_registered', height: 0 }],
      entities: [] };
    expect(() => parseGameState({ ...state, world: { ...state.world, navigation: {
      ...state.world.navigation, mountedRegion,
    } } })).toThrow('STATE_SHAPE');
  });

  it('accepts a canonical town session and rejects incoherent building phases', () => {
    const state = initialState();
    const town = { version: 1 as const, townRevision: 'a'.repeat(64), sceneId: 'city_dali',
      point: [5, 88] as const, buildingId: null, buildingPhase: 'outside' as const };
    expect(parseGameState({ ...state, chapter: { ...state.chapter, town } }).chapter.town).toEqual(town);
    expect(() => parseGameState({ ...state, chapter: { ...state.chapter,
      town: { ...town, buildingPhase: 'inside' } } })).toThrow('STATE_SHAPE');
  });

  it('rejects stale derived clock caches', () => {
    const state = initialState();
    expect(() => parseGameState({
      ...state,
      chapter: { ...state.chapter, clock: { ...state.chapter.clock, slotInDay: 7 } },
    })).toThrow('STATE_CLOCK_DERIVED');
    expect(() => parseGameState({
      ...state,
      chapter: { ...state.chapter, clock: { ...state.chapter.clock, dayIndex: 1 } },
    })).toThrow('STATE_CLOCK_DERIVED');
  });

  it('owns schema, protocol, navigation and transient slots in the canonical tree', () => {
    const state = initialState();
    expect(state.meta).toMatchObject({ saveSchema: SAVE_SCHEMA, rulesProtocol: RULES_PROTOCOL,
      masterSeed: 1, debugTainted: false });
    expect(state).not.toHaveProperty('transient');
    expect(state.world).toEqual({ navigation: { locationId: 'city_dali',
      selectedDestinationId: null, pendingMount: null, mountedRegion: null },
      pendingTimeAdvance: null });
    expect(state).toMatchObject({ battle: null, dialogue: null });
  });

  it('migrates every ui-session.v1 sidecar field without keeping the envelope', () => {
    const state = initialState();
    const hero = { characterId: 'npc_zhujue', status: 'active' as const,
      innate: { con: 1, str: 1, agi: 1, wis: 1, wil: 1, luk: 1, cha: 1 }, skills: [],
      meridians: { schemaVersion: 2 as const, opened: [], meridianStats: {},
        acupointStats: {}, targets: {}, turnCompleted: 0, lastAppliedMigration: 0 },
      legacyHpCredit: 0, legacyMpCredit: 0,
      stats: { hpMax: 10, mpMax: 10, strength: 1, speed: 1, tenacity: 1, coordination: 1 },
      resources: { hp: 7, mp: 8 } };
    const target = { characterId: hero.characterId, alive: true, hp: 7, hpMax: 10, mp: 8,
      mpMax: 10, stamina: 3, staminaMax: 5, ailments: [], temporaryEffects: [],
      permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 }, meridianAids: [],
      meridians: hero.meridians };
    const npcCharacter = { ...hero, characterId: 'npc_duanyu' };
    const npcTarget = { ...target, characterId: 'npc_duanyu' };
    const old = { schema: 'ui-session.v1', preview: true, location: '旧显示串',
      state: { ...state, meta: { coreVersion: '0.0.0', rngProtocol: 2, stateVersion: 0,
        worldTick: 0, nextEventSeq: 1, rng: state.meta.rng },
      profile: { protagonist: hero, companions: [] }, chapter: { ...state.chapter,
        npcs: undefined, itemChapterUses: undefined }, transient: { pendingTimeAdvance: null,
        dialogue: null, battle: null }, world: undefined, dialogue: undefined },
      known: [{ npcId: 'npc_duanyu', relationship: 'met', affinity: 2,
        character: npcCharacter }],
      usage: { battleUses: {}, chapterUses: { it_old: 1 } },
      itemTargets: { npc_zhujue: target, npc_duanyu: npcTarget } };
    const sourceContentHash = 'a'.repeat(64);
    const schema2 = migrateUiSessionV1(JSON.parse(JSON.stringify(old)), {
      fromContentHash: sourceContentHash, targetSchema: 2, remapVersion: 'none' }) as unknown as ReturnType<typeof initialState>;
    const migrated = migrateBookSleepV2(schema2 as unknown as JsonValue, {
      fromContentHash: sourceContentHash, targetSchema: 3, remapVersion: 'none'
    }) as unknown as ReturnType<typeof initialState>;
    expect(migrated.chapter.npcs[0]).toMatchObject({
      npcId: 'npc_duanyu', relationship: 'met', affinity: 2,
    });
    expect(migrated.chapter.itemChapterUses).toEqual({ it_old: 1 });
    expect(migrated.profile.protagonist?.consumable.stamina).toBe(3);
    expect(migrated.chapter.npcs[0]?.character?.consumable.stamina).toBe(3);
    expect(migrated.meta.contentHash).toBe(sourceContentHash);
    expect(migrated).not.toHaveProperty('schema'); expect(migrated).not.toHaveProperty('location');
    expect(parseGameState(migrated)).toEqual(migrated);
  });

  it('rejects non-empty legacy battle-use counters instead of silently dropping them', () => {
    const state = initialState();
    const old = { schema: 'ui-session.v1', state, known: [],
      usage: { battleUses: { it_old: 4 }, chapterUses: {} }, itemTargets: {} };
    expect(() => migrateUiSessionV1(old as unknown as JsonValue, { fromContentHash: '0'.repeat(64),
      targetSchema: SAVE_SCHEMA, remapVersion: 'none' }))
      .toThrow('MIGRATION_BATTLE_USES_ACTIVE');
  });
});

describe('GameClock', () => {
  it('projects the 23:00-based shichen display slots', () => {
    expect(createGameClock('epoch_ch01', 1093, 23 * TICKS_PER_HOUR).slotInDay).toBe(0);
    expect(createGameClock('epoch_ch01', 1093, TICKS_PER_HOUR).slotInDay).toBe(1);
  });

  it('emits 23:00 shichen boundaries and orders coincident calendar boundaries', () => {
    const firstShichen = createGameClock('epoch_ch01', 1093, 23 * TICKS_PER_HOUR - 1);
    expect(advanceGameClock(firstShichen, 1).events.map((event) => event.kind)).toEqual(['shichen']);
    const yearBoundary = createGameClock('epoch_ch01', 1093, 360 * TICKS_PER_DAY - 1);
    expect(advanceGameClock(yearBoundary, 1).events.map((event) => event.kind)).toEqual([
      'day', 'month', 'year',
    ]);
  });

  it('uses the documented explicit advancement rules', () => {
    const start = createGameClock('epoch_ch01', 1093);
    expect(advanceMeditation(start).clock.elapsedTicks).toBe(TICKS_PER_HOUR);
    expect(advanceTravel(start, 61).clock.elapsedTicks).toBe(2 * TICKS_PER_HOUR);
    expect(advanceBattle(start)).toEqual({ clock: start, events: [] });
    expect(advanceInnRest(createGameClock('epoch_ch01', 1093, 22 * TICKS_PER_HOUR)).clock.elapsedTicks)
      .toBe(30 * TICKS_PER_HOUR);
  });
});

describe('equipment state', () => {
  it('creates all eleven deterministic empty slots', () => {
    const equipment = createEmptyEquipment();
    expect(equipment.entries).toHaveLength(11);
    expect(new Set(equipment.entries.map((entry) => entry.slot)).size).toBe(11);
    expect(equipment.entries.every((entry) => entry.itemId === null)).toBe(true);
  });
});
