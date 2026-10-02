import { describe, expect, it } from 'vitest';
import { RNG_PROTOCOL, seedStream, type RngStreamName } from '../rng';
import {
  advanceBattle, advanceGameClock, advanceInnRest, advanceMeditation, advanceTravel,
  createEmptyEquipment, createGameClock, createInitialGameState, parseGameState,
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
