import { canonicalBookSleepPlan, chapterDef, FIRST_SLEEP_RULE,
  validFirstSleepAllocation } from '../progression';
import { createGameClock, createEmptyEquipment, withDerivedCharacterStats } from '../state';
import type { ChapterCommand, CommandHandler, RejectReason } from '.';

const HASH = /^[a-f0-9]{64}$/u;
const PLAN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
function existing(state: Parameters<CommandHandler<ChapterCommand>['validate']>[0], id: string) {
  return state.profile.progression?.bookSleepLog.find((entry) => entry.planId === id);
}
function canonical(command: ChapterCommand): string | null {
  try { return canonicalBookSleepPlan(command.plan); } catch { return null; }
}
function stringList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}
function planRejection(command: ChapterCommand): RejectReason | null {
  const plan = command.plan;
  if (!plan || !PLAN_ID.test(plan.id) || !/^slp_[a-z0-9_]+$/u.test(plan.sleepEventId) ||
      plan.allocationRuleVersion !== FIRST_SLEEP_RULE.version ||
      !['manual', 'balanced', 'default'].includes(plan.allocationSource) ||
      !stringList(plan.skills?.martial) || !stringList(plan.skills.inner) ||
      !stringList(plan.convert?.forget) || !stringList(plan.convert.dissipate) ||
      !stringList(plan.equips) || !stringList(plan.acknowledged) ||
      canonical(command) === null) return 'BOOK_SLEEP_PLAN_INVALID';
  if (plan.skills.martial.length || plan.skills.inner.length || plan.convert.forget.length ||
      plan.convert.dissipate.length || plan.equips.length) return 'BOOK_SLEEP_PLAN_INVALID';
  return validFirstSleepAllocation(plan.sleepAlloc) ? null : 'BOOK_SLEEP_ALLOCATION_INVALID';
}

export const bookSleepHandler: CommandHandler<ChapterCommand> & {
  noop(state: Parameters<CommandHandler<ChapterCommand>['validate']>[0], command: ChapterCommand): boolean;
} = {
  noop(state, command) {
    const receipt = existing(state, command.plan?.id ?? '');
    return receipt !== undefined && receipt.planJson === canonical(command);
  },
  validate(state, command, content) {
    const receipt = existing(state, command.plan?.id ?? '');
    const planJson = canonical(command);
    if (receipt) return receipt.planJson === planJson ? null : 'BOOK_SLEEP_PLAN_CONFLICT';
    if (command.plan?.from !== 'ch00_yuenv' || command.plan.to !== 'ch10_baima' ||
        state.chapter.chapterId !== command.plan.from) return 'BOOK_SLEEP_UNSUPPORTED';
    const invalid = planRejection(command); if (invalid) return invalid;
    if (state.battle !== null || state.dialogue !== null) return 'BOOK_SLEEP_BUSY';
    if ((state.profile.progression?.changshengLayer ?? 0) < 1 ||
        state.chapter.prologue?.exitKey !== 'first_sleep_to_baima') return 'BOOK_SLEEP_NOT_READY';
    const target = chapterDef(content.chapters, command.plan.to);
    if (!target || target.worldTier !== command.plan.targetTier ||
        !content.targetContentHash || !HASH.test(content.targetContentHash))
      return 'BOOK_SLEEP_CONTENT_UNAVAILABLE';
    return null;
  },
  apply(tx, command) {
    const plan = command.plan; const target = chapterDef(tx.content.chapters, plan.to)!;
    const sourceEraLayerId = tx.state.chapter.eraLayerId;
    const protagonist = tx.state.profile.protagonist;
    if (!protagonist) return tx.abort('BOOK_SLEEP_NOT_READY');
    const innate = { ...protagonist.innate };
    for (const key of FIRST_SLEEP_RULE.keys) innate[key] = plan.sleepAlloc[key]!;
    const allocated = withDerivedCharacterStats({ ...protagonist, innate, skills: [] }, []);
    const clock = createGameClock(`epoch_${target.id}`, target.gameYear.start, target.startTick);
    const planJson = canonicalBookSleepPlan(plan);
    const log = [...tx.state.profile.progression!.bookSleepLog, { planId: plan.id, planJson,
      from: plan.from, to: plan.to, ruleVersion: FIRST_SLEEP_RULE.version,
      allocationSource: plan.allocationSource, sleepEventId: plan.sleepEventId,
      contentHash: tx.content.targetContentHash! }];
    tx.set(['profile', 'protagonist'], allocated); tx.set(['profile', 'companions'], []);
    tx.set(['profile', 'progression', 'bookSleepLog'], log);
    tx.set(['party', 'inventory'], { stacks: [] }); tx.set(['party', 'equipment'], createEmptyEquipment());
    tx.set(['party', 'money'], 0);
    tx.set(['chapter'], { chapterId: target.id, eraLayerId: target.eraLayerId,
      worldTier: target.worldTier, worldYear: target.gameYear.start, clock,
      story: { chapterId: target.id, lines: [] }, worldItems: { entries: [] }, shops: [],
      worldMap: null, town: null, npcs: [], itemChapterUses: {} });
    tx.set(['world'], { navigation: { locationId: target.wake.sceneId,
      selectedDestinationId: null, pendingMount: { ...target.wake }, mountedRegion: null },
      pendingTimeAdvance: null, ...(tx.state.world.battleReceipts === undefined ? {}
        : { battleReceipts: tx.state.world.battleReceipts }) });
    tx.set(['meta', 'worldTick'], target.startTick);
    tx.set(['meta', 'contentHash'], tx.content.targetContentHash!);
    tx.emit({ t: 'chapter/bookSleepCommitted', payload: { planId: plan.id, from: plan.from,
      to: plan.to, ruleVersion: FIRST_SLEEP_RULE.version, allocationSource: plan.allocationSource } });
    tx.emit({ t: 'world/eraChanged', payload: { fromEraLayerId: sourceEraLayerId,
      eraLayerId: target.eraLayerId, worldYear: target.gameYear.start } });
    tx.emit({ t: 'chapter/woke', payload: { chapterId: target.id, regionId: target.wake.regionId,
      sceneId: target.wake.sceneId, spawnId: target.wake.spawnId } });
  },
};
