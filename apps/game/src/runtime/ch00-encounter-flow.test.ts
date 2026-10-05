import { resolve } from 'node:path';
import { buildContent } from '@tianshu/data/build';
import type { ContentSource } from '@tianshu/data';
import { chooseAutoCommand, peekReadyUnitId, replaySessionProjection,
  runBattleReplay } from '@tianshu/core';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { beforeAll, describe, expect, it } from 'vitest';
import type { GameRemote, GameUpdate, SessionSnapshot } from './contracts';
import { createLoadedGameSession } from './session';
import { fixtureContent } from './test-fixture';

const CHAPTER = 'ch00_yuenv';
const REGION = 'rg_jiangnan_taihu';
const IDENTITY = { name: '沈砚', gender: 'female', appearance: 'hero_f01',
  pronoun: '她', originId: 'origin_wenshiguan' };
type Session = GameRemote & { createNewGame(input: { readonly identity: typeof IDENTITY;
  readonly difficulty: 'diff_xiake' }): Promise<GameUpdate> };

let source: ContentSource;
beforeAll(async () => {
  const rootDir = resolve(import.meta.dirname, '../../../..');
  const result = await buildContent({ rootDir, chapter: CHAPTER, write: false });
  expect(result.diagnostics.filter((entry) => entry.severity === 'error')).toEqual([]);
  const built = result.chapters.find((row) => row.chapter === CHAPTER)!;
  const values = new Map<string, unknown>([[`${CHAPTER}/manifest.json`, built.manifest],
    ...built.leaves.map((leaf): [string, unknown] =>
      [`${CHAPTER}/${leaf.logicalName}`, leaf.value])]);
  source = { readJson: async (path) => values.get(path) };
}, 20_000);

async function session(initial?: SessionSnapshot): Promise<Session> {
  const created = await createLoadedGameSession(fixtureContent(), source, initial, undefined,
    { demo: false, seedSource: () => 0x00c0ffee });
  if (!initial) {
    const update = await created.createNewGame({ identity: IDENTITY, difficulty: 'diff_xiake' });
    expect(update.accepted).toBe(true);
  }
  return created;
}
function flags(state: SessionSnapshot) {
  return state.profile.replayRules?.switches ?? {};
}
function stage(state: SessionSnapshot, questId: string): string | undefined {
  return state.chapter.story.lines.find((row) => row.lineId === questId)?.activeNodeIds[0];
}
function quest(state: SessionSnapshot, questId: string) {
  return state.chapter.story.lines.find((row) => row.lineId === questId);
}
async function dispatch(target: Session, command: Parameters<Session['dispatch']>[0]): Promise<GameUpdate> {
  const update = await target.dispatch(command);
  expect(update.accepted, `${command.t}:${update.error ?? ''}`).toBe(true);
  return update;
}
async function mount(target: Session, sceneId: string, spawnId: string): Promise<void> {
  await dispatch(target, { t: 'world/mountRegion', regionId: REGION, sceneId, spawnId });
}
async function talk(target: Session, anchorId: string): Promise<void> {
  const projection = await target.query();
  const anchor = projection.region?.interactableAnchors.find((row) => row.anchorId === anchorId);
  expect(anchor?.enabled).toBe(true);
  await dispatch(target, { t: 'world/interact', anchorId });
}
async function drainDialogue(target: Session, choose?: (choices: readonly {
  readonly choiceIndex: number; readonly textKey: string }[]) => number,
  stopAtBattle = false): Promise<void> {
  for (let step = 0; step < 80; step += 1) {
    const projection = await target.query();
    if (stopAtBattle && projection.battle) return;
    const view = projection.dialogue;
    if (!view) return;
    if (view.choices.length > 0) {
      const selected = choose?.(view.choices) ?? view.choices[0]!.choiceIndex;
      await dispatch(target, { t: 'dialogue/choose', choiceIndex: selected });
    } else await dispatch(target, { t: 'dialogue/continue' });
  }
  throw new Error('DIALOGUE_DID_NOT_COMPLETE');
}
function stateBytes(value: SessionSnapshot): string {
  return canonicalJson(value as unknown as JsonValue);
}
const AUTO_POLICY = { style: 'aggressive' as const, reserveMpBp: 0,
  allowUltimate: true, allowItems: false };
type PlayerStrategy = 'auto' | 'focus-wu2' | 'wait' | 'guard';
async function actBattle(target: Session, player: PlayerStrategy): Promise<GameUpdate> {
  const state = await target.snapshot(); const battle = state.battle!;
  const actorId = peekReadyUnitId(battle.battle);
  const actor = battle.battle.units.find((row) => row.id === actorId)!;
  const playerActor = battle.battle.units.find((unit) => unit.active && unit.control === 'player');
  const subdued = playerActor && battle.battle.units.filter((unit) => unit.active
    && battle.battle.setup.relations[playerActor.side][unit.side] === 'hostile'
    && unit.hp * 10_000 <= unit.hpMax * 3_000)
    .sort((left, right) => left.unitIndex - right.unitIndex)[0];
  if (subdued) return dispatch(target, { t: 'battle/subdue', actor: playerActor.id,
    target: subdued.id, revision: battle.revision });
  if (actor.control === 'ai') return dispatch(target, { t: 'battle/step',
    revision: battle.revision });
  if (player === 'wait') return dispatch(target, { t: 'battle/wait', actor: actor.id,
    revision: battle.revision });
  if (player === 'guard') return dispatch(target, { t: 'battle/defend', actor: actor.id,
    revision: battle.revision });
  const command = chooseAutoCommand(battle.battle, actor, player === 'focus-wu2'
    ? { ...AUTO_POLICY, preferredTarget: 'wu_swordsman_2' } : AUTO_POLICY);
  if (command.t === 'battle/act' && command.walkTo
    && (command.walkTo.q !== actor.pos.q || command.walkTo.r !== actor.pos.r))
    return dispatch(target, { t: 'battle/move', actor: actor.id,
      destination: command.walkTo, revision: battle.revision });
  if (command.t === 'battle/wait' || command.action.t === 'wait')
    return dispatch(target, { t: 'battle/move', actor: actor.id,
      destination: command.t === 'battle/act' && command.walkTo ? command.walkTo : actor.pos,
      revision: battle.revision });
  if (command.action.t === 'guard')
    return dispatch(target, { t: 'battle/defend', actor: actor.id, revision: battle.revision });
  if (command.action.t === 'acuteQiGather') return dispatch(target, { t: 'battle/gather',
    actor: actor.id, routeId: command.action.routeRef, revision: battle.revision });
  if (command.action.t !== 'skill') throw new Error('PLAYER_AUTO_UNSUPPORTED');
  const targetId = typeof command.action.target === 'string' ? command.action.target : undefined;
  const enemy = battle.battle.units.find((row) => row.id === targetId);
  if (!enemy) throw new Error('PLAYER_AUTO_TARGET');
  const preview = await dispatch(target, { t: 'battle/preview', revision: battle.revision,
    actor: actor.id, moveId: command.action.move, anchor: enemy.pos,
    aim: command.action.aim ?? { dir: 0, dirCount: 6 }, requestId: battle.decisionOrdinal + 1 });
  const area = preview.changes.battle;
  if (!area || !('preview' in area) || !area.preview) throw new Error('PLAYER_AUTO_PREVIEW');
  return dispatch(target, { t: 'battle/act-at', preview: area.preview });
}
async function runUntilEnded(target: Session, player: PlayerStrategy, max = 200):
Promise<SessionSnapshot> {
  for (let count = 0; count < max; count += 1) {
    const state = await target.snapshot();
    if (state.battle?.battle.phase === 'ended') return state;
    await actBattle(target, player);
  }
  throw new Error('BATTLE_DID_NOT_END');
}
async function leaveBattle(target: Session): Promise<GameUpdate> {
  const state = await target.snapshot();
  expect(state.battle?.battle.phase).toBe('ended');
  return dispatch(target, { t: 'battle/leave' });
}
async function retryBattle(target: Session): Promise<void> {
  const state = await target.snapshot();
  expect(state.battle).toMatchObject({ battle: { phase: 'ended', result: 'lose' } });
  await dispatch(target, { t: 'battle/retry', revision: state.battle!.revision });
}
function eventCount(state: SessionSnapshot, type: string): number {
  return state.battle?.battle.events.filter((event) => event.t === type).length ?? 0;
}
function chooseVisible(position: number) {
  return (choices: readonly { readonly choiceIndex: number }[]) => {
    const choice = choices[position];
    if (!choice) throw new Error(`DIALOGUE_CHOICE_MISSING:${position}`);
    return choice.choiceIndex;
  };
}
function resultDialogues(update: GameUpdate): readonly { readonly storyId: string; readonly knot: string }[] {
  return update.events.flatMap((event) => {
    if (event.t !== 'world/eventPresented' || !event.payload || typeof event.payload !== 'object'
      || Array.isArray(event.payload)) return [];
    const steps = (event.payload as { steps?: unknown }).steps;
    if (!Array.isArray(steps)) return [];
    return steps.flatMap((step) => step && typeof step === 'object'
      && (step as { op?: unknown }).op === 'dialogue/start'
      && typeof (step as { storyId?: unknown }).storyId === 'string'
      && typeof (step as { knot?: unknown }).knot === 'string'
      ? [{ storyId: (step as { storyId: string }).storyId, knot: (step as { knot: string }).knot }] : []);
  });
}
async function playResultDialogues(target: Session, update: GameUpdate): Promise<void> {
  await drainDialogue(target);
  for (const step of resultDialogues(update)) {
    await dispatch(target, { t: 'dialogue/start', storyId: step.storyId, entryKey: step.knot });
    await drainDialogue(target);
  }
}
function expectReplay(state: SessionSnapshot): void {
  const battle = state.battle!;
  const replay = runBattleReplay(battle, battle.commandLog);
  expect(replay.rejected).toEqual([]);
  expect(replay.session).toEqual(replaySessionProjection(battle));
}

describe('ch00 production encounter flows', () => {
  it('runs bamboo losses, demonstration and frozen-scene return byte-identically twice',
    async () => {
    async function run(): Promise<string> {
    let game = await session();
    await mount(game, 'sc_00_zhulin', 'bookfall');
    await dispatch(game, { t: 'world/walkTo', hex: { q: 8, r: 9 } });
    await talk(game, 'npc_aqing_zhulin');
    await drainDialogue(game, undefined, true);
    let state = await game.snapshot();
    expect(state.battle?.battle.setup).toMatchObject({ encounterId: 'enc_00_zhulin',
      returnContext: { sceneRef: 'sc_00_zhulin', anchorRef: 'npc_aqing_zhulin' } });
    expect(state.battle?.battle.grid.cells).toHaveLength(61);
    expect(state.battle?.battle.grid.cells.some((cell) => cell.narrow
      && cell.moveCost === 2)).toBe(true);
    expect(state.battle?.battle.grid.cells.some((cell) => !cell.narrow
      && cell.moveCost === 2)).toBe(true);
    expect(state.battle?.battle.grid.cells.every((cell) => cell.canopy === 0
      && cell.los === 'none' && cell.cover === null)).toBe(true);
    const roadIds = state.battle?.battle.setup.participants
      .filter((row) => row.group === 'role_road_swordsman')
      .map((row) => row.sourceInstanceId);
    expect(roadIds).toHaveLength(2);
    expect(new Set(roadIds).size).toBe(2);
    expect(roadIds?.every((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u
      .test(id ?? ''))).toBe(true);
    expect(roadIds).toEqual(['fcebe4d3-c566-5214-910b-6620f0b115d0',
      'd3d2615b-2b3f-5cae-8b4a-064a79067801']);
    let ended = await runUntilEnded(game, 'wait');
    expect(ended.battle?.battle.result).toBe('lose');
    expect(eventCount(ended, 'battle/aqingRescue')).toBe(1);
    await retryBattle(game);
    state = await game.snapshot();
    expect(flags(state)['fl_00_zhulin_loss_streak1']).toBe(true);
    const savedBytes = stateBytes(state);
    game = await session(state);
    expect(stateBytes(await game.snapshot())).toBe(savedBytes);

    ended = await runUntilEnded(game, 'wait');
    expect(ended.battle?.battle.result).toBe('lose');
    await retryBattle(game); state = await game.snapshot();
    expect(flags(state)['fl_00_zhulin_loss_streak2']).toBe(true);
    expect(eventCount(state, 'battle/terrainHint')).toBe(1);
    ended = await runUntilEnded(game, 'wait');
    expect(ended.battle?.battle.result).toBe('lose');
    await retryBattle(game); state = await game.snapshot();
    expect(flags(state)['fl_00_zhulin_loss_streak3']).toBe(true);
    expect(eventCount(state, 'battle/aqingRescue')).toBe(1);
    expect(eventCount(state, 'battle/terrainHint')).toBe(1);
    expect(eventCount(state, 'battle/demonstrationOffered')).toBe(1);
    await dispatch(game, { t: 'battle/demonstration', replayId: 'replay_zhulin_demo',
      revision: state.battle!.revision });
    state = await game.snapshot();
    expect(state.battle?.battle.result).toBe('win'); expectReplay(state);
    const returned = await leaveBattle(game);
    await drainDialogue(game); state = await game.snapshot();
    expect(returned.events.at(-1)).toMatchObject({ t: 'battle/returned', payload: {
      sceneRef: 'sc_00_zhulin', anchorRef: 'npc_aqing_zhulin' } });
    expect(flags(state)['fl_00_initial_battle_assisted']).toBe(true);
    expect(flags(state)['fl_00_initial_battle_manual']).not.toBe(true);
    expect([flags(state)['fl_00_zhulin_loss_streak1'],
      flags(state)['fl_00_zhulin_loss_streak2'],
      flags(state)['fl_00_zhulin_loss_streak3']]).toEqual([false, false, false]);
    expect(stage(state, 'q_00_main_c_02')).toBe('st_track');
    expect(state.world.navigation.locationId).toBe('sc_00_zhulin');
    expect(state.world.navigation.mountedRegion?.playerHex).toEqual({ q: 8, r: 9 });
    return stateBytes(state);
    }
    expect(await run()).toBe(await run());
  }, 60_000);

  it('concedes the white-ape spar and advances byte-identically twice', async () => {
    async function run(): Promise<string> {
    const game = await session(); let state = await game.snapshot();
    state = { ...state, profile: { ...state.profile, replayRules: { ...state.profile.replayRules!,
      switches: { ...flags(state), fl_00_initial_battle_manual: true } } },
    chapter: { ...state.chapter, story: { ...state.chapter.story, lines: [{
      lineId: 'q_00_main_c_02', status: 'active', activeNodeIds: ['st_track'],
      completedNodeIds: ['st_initial_battle'], expiredNodeIds: [], chosenOptions: {}, branchPath: [],
      resolvedWindows: {}, appliedEffectIds: [], revision: 1,
    }] } } };
    await game.restore(state);
    await mount(game, 'sc_00_shanjing', 'from_zhulin');
    await dispatch(game, { t: 'world/walkTo', hex: { q: 13, r: 7 } });
    await talk(game, 'npc_baiyuan_shanjing');
    // This fresh-run branch has no peach: disabled peach, spar, bypass; select spar.
    await drainDialogue(game, chooseVisible(1), true); state = await game.snapshot();
    expect(state.battle?.battle.setup).toMatchObject({ encounterId: 'enc_00_baiyuan',
      rules: { mode: 'spar' }, returnContext: { sceneRef: 'sc_00_shanjing', anchorRef: 'npc_baiyuan_shanjing',
        recovery: 'sparRestore' } });
    expect(state.battle?.battle.grid.cells).toHaveLength(73);
    const before = state.profile.protagonist?.resources;
    await dispatch(game, { t: 'battle/concede', revision: state.battle!.revision });
    state = await game.snapshot(); expect(state.battle?.battle.result).toBe('win'); expectReplay(state);
    const returned = await leaveBattle(game); await playResultDialogues(game, returned);
    state = await game.snapshot();
    expect(flags(state)).toMatchObject({ fl_00_baiyuan_spar_done: true, fl_00_baiyuan_merged: true });
    expect(quest(state, 'q_00_main_c_02')).toMatchObject({ status: 'completed',
      completedNodeIds: expect.arrayContaining(['st_close']) });
    expect(state.profile.protagonist?.resources).toEqual(before);
    expect(state.world.navigation.locationId).toBe('sc_00_shanjing');
    expect(state.world.navigation.mountedRegion?.playerHex).toEqual({ q: 13, r: 7 });
    return stateBytes(state);
    }
    expect(await run()).toBe(await run());
  }, 60_000);

  it('loses the real white-ape spar, restores its choice, and hashes resolved facts', async () => {
    const game = await session(); let state = await game.snapshot();
    state = { ...state, profile: { ...state.profile,
      protagonist: { ...state.profile.protagonist!, resources: {
        ...state.profile.protagonist!.resources, hp: 1 } },
      replayRules: { ...state.profile.replayRules!, switches: {
        ...flags(state), fl_00_initial_battle_manual: true } } },
    chapter: { ...state.chapter, story: { ...state.chapter.story, lines: [{
      lineId: 'q_00_main_c_02', status: 'active', activeNodeIds: ['st_track'],
      completedNodeIds: ['st_initial_battle'], expiredNodeIds: [], chosenOptions: {}, branchPath: [],
      resolvedWindows: {}, appliedEffectIds: [], revision: 1,
    }] } } };
    await game.restore(state); const opening = await game.snapshot();
    await mount(game, 'sc_00_shanjing', 'from_zhulin');
    await dispatch(game, { t: 'world/walkTo', hex: { q: 13, r: 7 } });
    await talk(game, 'npc_baiyuan_shanjing');
    await drainDialogue(game, chooseVisible(1), true);
    state = await game.snapshot();
    const lowHpHash = state.battle!.battle.setup.sourceSnapshotHash;
    expect(lowHpHash).toMatch(/^[0-9a-f]{64}$/u);

    const comparison = await session({ ...opening, profile: { ...opening.profile,
      protagonist: { ...opening.profile.protagonist!, resources: {
        ...opening.profile.protagonist!.resources, hp: 2 } } } });
    await mount(comparison, 'sc_00_shanjing', 'from_zhulin');
    await dispatch(comparison, { t: 'world/walkTo', hex: { q: 13, r: 7 } });
    await talk(comparison, 'npc_baiyuan_shanjing');
    await drainDialogue(comparison, chooseVisible(1), true);
    expect((await comparison.snapshot()).battle!.battle.setup.sourceSnapshotHash).not.toBe(lowHpHash);

    const ended = await runUntilEnded(game, 'wait');
    expect(ended.battle?.battle.result).toBe('lose'); expectReplay(ended);
    const returned = await leaveBattle(game); await drainDialogue(game);
    state = await game.snapshot();
    expect(returned.events.at(-1)).toMatchObject({ t: 'battle/returned', payload: {
      sceneRef: 'sc_00_shanjing', anchorRef: 'npc_baiyuan_shanjing' } });
    expect(flags(state)['fl_00_baiyuan_spar']).toBe(false);
    expect(stage(state, 'q_00_main_c_02')).toBe('st_baiyuan_choice');
    expect(state.world.navigation.locationId).toBe('sc_00_shanjing');
    await talk(game, 'npc_baiyuan_shanjing');
    await drainDialogue(game, chooseVisible(1), true);
    expect((await game.snapshot()).battle?.battle.setup.encounterId).toBe('enc_00_baiyuan');
  }, 30_000);

  it('wins the real roadside battle with its AI ally and is byte-identical twice', async () => {
    async function run(): Promise<string> {
      const game = await session(); let state = await game.snapshot();
      state = { ...state, profile: { ...state.profile, replayRules: { ...state.profile.replayRules!,
        switches: { ...flags(state), fl_00_baiyuan_merged: true } } },
      chapter: { ...state.chapter, story: { ...state.chapter.story, lines: [{
        lineId: 'q_00_main_c_02', status: 'completed', activeNodeIds: [],
        completedNodeIds: ['st_initial_battle', 'st_track', 'st_baiyuan_choice', 'st_merge', 'st_close'],
        expiredNodeIds: [], chosenOptions: {}, branchPath: [], resolvedWindows: {},
        appliedEffectIds: [], revision: 5,
      }] } } };
      await game.restore(state);
      await mount(game, 'sc_00_yueying', 'camp_gate_inside');
      await dispatch(game, { t: 'world/walkTo', hex: { q: 13, r: 6 } });
      await talk(game, 'npc_fanli_yueying'); await drainDialogue(game, undefined, true);
      state = await game.snapshot();
      expect(state.battle?.battle.setup).toMatchObject({ encounterId: 'enc_00_biandao',
        rules: { mercyAllowed: true, lethalIntent: false },
        returnContext: { sceneRef: 'sc_00_yueying', anchorRef: 'npc_fanli_yueying' } });
      expect(state.battle?.battle.grid.cells).toHaveLength(91);
      const forest = state.battle?.battle.grid.cells.filter((cell) => cell.terrainId === 'tr_zhulin') ?? [];
      expect(forest).toHaveLength(12);
      expect(forest.every((cell) => cell.canopy === 3 && cell.los === 'partial'
        && cell.cover?.hitByDelivery?.projectile === -10
        && cell.cover.hitByDelivery.ranged === -5)).toBe(true);
      expect(state.battle?.battle.units.find((row) => row.id === 'yue_soldier_1'))
        .toMatchObject({ side: 'ally', control: 'ai', active: true });
      const ended = await runUntilEnded(game, 'auto');
      expect(ended.battle?.battle.result, canonicalJson({ units: ended.battle?.battle.units.map(
        (row) => [row.id, row.hp, row.hpMax, row.active, row.pos]),
      commands: ended.battle?.commandLog } as unknown as JsonValue)).toBe('win'); expectReplay(ended);
      const returned = await leaveBattle(game);
      expect(resultDialogues(returned).map((row) => row.knot)).toEqual([
        'biandao_after', 'sword_source', 'nine_layer_preview',
      ]);
      await playResultDialogues(game, returned); state = await game.snapshot();
      expect(flags(state)).toMatchObject({ fl_00_biandao_done: true,
        fl_00_sword_demo_seen: true, fl_00_nine_preview_seen: true });
      expect(quest(state, 'q_00_main_c_03')).toMatchObject({ status: 'completed',
        completedNodeIds: expect.arrayContaining(['st_sword_demo', 'st_nine_preview', 'st_close']) });
      expect(state.world.navigation.locationId).toBe('sc_00_yueying');
      expect(state.world.navigation.mountedRegion?.playerHex).toEqual({ q: 13, r: 6 });
      return stateBytes(state);
    }
    expect(await run()).toBe(await run());
  }, 30_000);
});
