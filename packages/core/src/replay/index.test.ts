// eslint-disable-next-line no-restricted-imports -- Test-only SHA-256 port; runtime stays platform-neutral.
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { advanceBattleToReady, computeBattleRewards, emitBattleRewards, previewBattleRoute,
  resolveBattleAction, type BattleCommand, type BattleState, type MeridianFlowInput } from '../battle';
import { createRng, seedStream } from '../rng';
import { BASIC_MOVE, combatFixture } from '../testing/combat-fixture';
import type { ItemDef } from '@tianshu/data/schemas';
import {
  acceptedCommandPrefix, battleReplayHashDomain, canonicalBattleReplayHashInput, hashBattleReplay,
  runBattleReplay, type BattleReplayHashParts,
} from './index';

const accepted: readonly BattleCommand[] = [
  { t: 'battle/act', actor: 'hero', action: { t: 'skill', move: 'mv_basic_strike', target: 'enemy_0' } },
  { t: 'battle/act', actor: 'enemy_0', action: { t: 'skill', move: 'mv_basic_strike', target: 'hero' } },
];
const rejected: BattleCommand =
  { t: 'battle/act', actor: 'enemy_0', action: { t: 'skill', move: 'mv_basic_strike', target: 'hero' } };
const sha256 = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');

function replay(commands: readonly BattleCommand[]) {
  const run = runBattleReplay(combatFixture({ seed: 20261001 }), commands);
  const parts: BattleReplayHashParts = { appBuild: 'test-app-1', coreVersion: 'test-core-1',
    rulesProtocol: 3, rngProtocol: 2, contentHash: 'a'.repeat(64), runtimeMartialArts: [],
    commandPrefix: acceptedCommandPrefix(run.records), session: run.session };
  return { run, parts, input: canonicalBattleReplayHashInput(parts), hash: hashBattleReplay(parts, sha256) };
}

function routedBattle() {
  const input: MeridianFlowInput[] = ['hero', 'enemy_0'].map((unitId) => ({ unitId,
    productionPerTick: 8, qiSpeedBp: 10_000, practiceBp: 9_800,
    nodes: [{ acupointRef: 'ap_test', opened: true, fluxCap: 16, lengthUnit: 6, flowBp: 10_000 }],
    routes: [{ routeId: 'mfr_test', purpose: 'attack', steps: [
      { acupointRef: 'ap_test', lengthUnit: 6, segmentCt: 60, riskBp: 0 },
    ] }], activeRouteId: 'mfr_test' }));
  const item: ItemDef = { schemaVersion: 'item.v1', id: 'it_test_heal', name: '测试药', kind: 'pill',
    sub: 'medicine', grade: 1, stack: 9, chapters: 'any', origin: 'expanded', price: 1, flags: [],
    use: { context: 'battle', action: 'consume', target: 'self',
      effects: [{ op: 'healPct', params: { valueBp: 1_000 } }] },
    assets: { icon: 'item/test' }, text: { desc: '测试药' }, extension: { type: 'generic', value: {} } };
  const move = { ...BASIC_MOVE, meridianRouteRef: 'mfr_test' };
  return combatFixture({ seed: 20261002, hp: 2_400, playerMoves: [move], enemyMoves: [move],
    meridianInputs: input, itemDefs: [item], inventory: { stacks: [{ itemId: item.id, count: 2 }] } });
}

function terminalReplay(previews: number, restoreAt?: number) {
  let battle = routedBattle(); let rng = createRng(seedStream(battle.setup.seed, 'battle'));
  while (battle.phase !== 'ended' && battle.actionNo < 100) {
    const next = advanceBattleToReady(battle);
    if (next.kind !== 'unit') throw new Error('TEST_BATTLE_STALLED');
    const actor = battle.units.find((unit) => unit.id === next.unitId)!;
    const before = JSON.stringify(battle); const rngBefore = rng.snapshot();
    for (let preview = 0; preview < previews; preview += 1) {
      previewBattleRoute(battle, actor.id, 'mfr_test');
    }
    expect(JSON.stringify(battle)).toBe(before); expect(rng.snapshot()).toEqual(rngBefore);
    const action: Extract<BattleCommand, { t: 'battle/act' }>['action'] = actor.ownActions === 0
      ? { t: 'acuteQiGather', routeRef: 'mfr_test' } : actor.ownActions === 1
        ? actor.id === 'hero' ? { t: 'item', item: 'it_test_heal', target: actor.id } : { t: 'guard' }
        : { t: 'skill', move: BASIC_MOVE.id, target: actor.id === 'hero' ? 'enemy_0' : 'hero' };
    const resolved = resolveBattleAction(battle, { t: 'battle/act', actor: actor.id, action }, rng);
    expect(resolved, `action=${battle.actionNo}`).toMatchObject({ accepted: true });
    if (battle.actionNo === restoreAt) {
      battle = JSON.parse(JSON.stringify(battle)) as BattleState; rng = createRng(rng.snapshot());
    }
  }
  expect(battle.phase).toBe('ended');
  emitBattleRewards(battle, computeBattleRewards(battle));
  const session = { battle, battleRng: rng.snapshot(),
    aiRng: createRng(seedStream(battle.setup.seed, 'ai')).snapshot(),
    acceptedOrdinal: battle.actionNo, decisionOrdinal: battle.actionNo };
  const parts: BattleReplayHashParts = { appBuild: 'test-app-1', coreVersion: 'test-core-1',
    rulesProtocol: 3, rngProtocol: 2, contentHash: 'a'.repeat(64), runtimeMartialArts: [],
    commandPrefix: battle.acceptedCommands, session };
  return { battle, rng: rng.snapshot(), hash: hashBattleReplay(parts, sha256) };
}

describe('battle replay protocol', () => {
  it('replays the same seed and accepted commands to the golden SHA-256', () => {
    const first = replay(accepted); const second = replay(accepted);
    expect(second.input).toBe(first.input); expect(second.hash).toBe(first.hash);
    expect(first.hash).toBe('e3e3349441555c4d15ab3d4b043db82e82284ea707af72ff77550c14a97b26e3');
    expect(first.run.session.battle.acceptedCommands).toEqual(accepted);
  });

  it('explains the golden change solely by the newly serialized battle fields', () => {
    const current = replay(accepted); const previous = structuredClone(current.parts);
    const battle = previous.session as unknown as { battle: Record<string, unknown> };
    const setup = battle.battle['setup'] as Record<string, unknown>;
    for (const key of ['meridianInputs', 'inventory', 'itemDefs', 'rewards']) delete setup[key];
    for (const key of ['meridianByUnit', 'inventory', 'rewardStats']) delete battle.battle[key];
    for (const unit of battle.battle['units'] as Array<Record<string, unknown>>) {
      for (const key of ['redirectedQiExpiresAtOwnAction', 'medical', 'innerGrade', 'stamina',
        'staminaMax', 'healingReceivedBp', 'itemEffects', 'itemState']) delete unit[key];
      for (const move of unit['moves'] as Array<Record<string, unknown>>) delete move['skillId'];
    }
    expect(hashBattleReplay(previous, sha256))
      .toBe('13dd4a494b6662b49f7aea090376c3409326a1f472a520b88d1e42609d8df9a7');
  });

  it('restores a mid-battle state and battle RNG to identical final canonical bytes', () => {
    const control = replay(accepted);
    const state = combatFixture({ seed: 20261001 });
    const battleRng = createRng(seedStream(state.setup.seed, 'battle'));
    advanceBattleToReady(state);
    expect(resolveBattleAction(state, accepted[0]!, battleRng).accepted).toBe(true);
    if (state.phase !== 'ended') advanceBattleToReady(state);

    const savedBattle = structuredClone(state);
    const savedBattleRng = battleRng.snapshot();
    const restoredBattle = structuredClone(savedBattle);
    const restoredRng = createRng(savedBattleRng);
    expect(resolveBattleAction(restoredBattle, accepted[1]!, restoredRng).accepted).toBe(true);
    if (restoredBattle.phase !== 'ended') advanceBattleToReady(restoredBattle);

    const restoredSession = { battle: restoredBattle, battleRng: restoredRng.snapshot(),
      aiRng: createRng(seedStream(state.setup.seed, 'ai')).snapshot(),
      acceptedOrdinal: 2, decisionOrdinal: 2 };
    const restoredParts = { ...control.parts, session: restoredSession };
    expect(canonicalBattleReplayHashInput(restoredParts)).toBe(control.input);
    expect(hashBattleReplay(restoredParts, sha256)).toBe(control.hash);
  });

  it('excludes rejected attempts from the prefix and all deterministic state', () => {
    const clean = replay(accepted); const withRejected = replay([rejected, ...accepted]);
    expect(withRejected.run.rejected).toEqual([expect.objectContaining({ inputIndex: 0,
      error: 'NOT_YOUR_TURN' })]);
    expect(withRejected.parts.commandPrefix).toEqual(accepted);
    expect(withRejected.input).toBe(clean.input); expect(withRejected.hash).toBe(clean.hash);
  });

  it('reaches the same routed terminal hash with 0, 1 or 100 previews before every action', () => {
    const control = terminalReplay(0);
    for (const count of [1, 100]) {
      const previewed = terminalReplay(count);
      expect(previewed.rng).toEqual(control.rng);
      expect(previewed.hash).toBe(control.hash);
    }
    expect(control.battle.actionNo).toBeGreaterThan(4);
    expect(control.battle.events.map((event) => event.t)).toEqual(expect.arrayContaining([
      'battle/acuteQiGathered', 'battle/itemUsed', 'battle/guarded', 'qi.moveResolved', 'battle/rewards',
    ]));
    expect(control.battle.rewardStats.fullCirculations.length).toBeGreaterThan(0);
  });

  it('rebuilds every unit runtime after a JSON mid-battle checkpoint and reaches the same terminal hash', () => {
    const control = terminalReplay(0);
    const restored = terminalReplay(100, 7);
    expect(restored.hash).toBe(control.hash);
    expect(restored.rng).toEqual(control.rng);
    expect(restored.battle).toEqual(control.battle);
  });

  it('puts command payloads in the exact domain and changes the hash when one changes', () => {
    const base = replay(accepted);
    expect(battleReplayHashDomain(base.parts).slice(0, 8)).toEqual([
      'tianshu:battle-replay:v1', 'test-app-1', 'test-core-1', 3, 2, 'a'.repeat(64), [], accepted,
    ]);
    const changed = { ...base.parts, commandPrefix: [
      { t: 'battle/wait', actor: 'hero' } as const, accepted[1]!,
    ] };
    expect(canonicalBattleReplayHashInput(changed)).not.toBe(base.input);
    expect(hashBattleReplay(changed, sha256)).not.toBe(base.hash);
  });

  it('rejects duplicate or gapped accepted sequence numbers', () => {
    expect(() => acceptedCommandPrefix([{ seq: 1, command: accepted[0]! }]))
      .toThrow('REPLAY_COMMAND_SEQUENCE');
  });
});
