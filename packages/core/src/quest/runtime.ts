import { compareCodePoints, floorDivInt, type JsonValue } from '@tianshu/shared';
import type { StoryLine } from '@tianshu/data/schemas';
import { EMPTY_NPC_WORLD } from '../npc';
import { createGameClock, createStoryState, TICKS_PER_MINUTE, TICKS_PER_YEAR,
  cloneJsonValue, type GameClock, type StoryLineState } from '../state';
import { compileStoryLines, type CompiledStoryLine, type CompiledStoryNode } from './compile';
import { DeadlineQueue } from './deadlines';
import { executeNode } from './executors';
import type { ConditionFacts } from './condition';
import type { StoryEvent, StoryRuntimePorts, StoryRuntimeSnapshot, StoryStepResult } from './runtime-models';
import { addUnique, deriveStoryFacts, findLine, nodeReceipt, replaceLine, updateLine } from './runtime-state';
import { resolveWindow } from './windows';

function noopQuestPorts(): StoryRuntimePorts['quest'] {
  return { activate: () => undefined, executeEvent: () => undefined };
}
function event(t: `story/${string}`, lineId: string, nodeId: string, receiptId: string,
  chapterId: string, payload?: JsonValue): StoryEvent {
  return { t, chapterId, lineId, nodeId, causeId: receiptId, receiptId,
    ...(payload === undefined ? {} : { payload }) };
}
export class StoryRuntime {
  readonly #lines: ReadonlyMap<string, CompiledStoryLine>;
  readonly #ports: StoryRuntimePorts; readonly #clock: GameClock;
  readonly #deadlines = new DeadlineQueue();
  #snapshot: StoryRuntimeSnapshot;

  public constructor(lines: readonly StoryLine[], options: { readonly nowTick?: number;
    readonly epochId?: string; readonly epochYear?: number; readonly ports?: StoryRuntimePorts;
    readonly facts?: ConditionFacts; readonly snapshot?: StoryRuntimeSnapshot } = {}) {
    this.#lines = new Map(compileStoryLines(lines).map((line) => [line.line.lineId, line]));
    this.#ports = options.ports ?? { quest: noopQuestPorts() };
    const main = lines.find((line) => line.kind === 'main');
    if (main === undefined) throw new TypeError('STORY_MAIN_COUNT');
    const epochYear = options.epochYear ?? 1093;
    this.#clock = createGameClock(options.epochId ?? `epoch_${main.eraLayer}`, epochYear,
      options.nowTick ?? options.snapshot?.nowTick ?? 0);
    this.#snapshot = options.snapshot ?? { chapterId: main.chapterId, nowTick: this.#clock.elapsedTicks,
      lines: createStoryState(main.chapterId, lines).lines, npc: EMPTY_NPC_WORLD,
      facts: options.facts ?? {},
      wait: null, suspendedWaits: [], lineWindows: {},
      endingTags: [], eventTicks: {} };
    if (this.#snapshot.suspendedWaits === undefined)
      this.#snapshot = { ...this.#snapshot, suspendedWaits: [] };
    if (this.#snapshot.lineWindows === undefined)
      this.#snapshot = { ...this.#snapshot, lineWindows: {} };
    this.#rebuildDeadlines();
  }
  public snapshot(): StoryRuntimeSnapshot { return cloneJsonValue(this.#snapshot); }

  #compiled(lineId: string): CompiledStoryLine {
    const line = this.#lines.get(lineId);
    if (line === undefined) throw new TypeError(`STORY_CONTENT_LINE:${lineId}`);
    return line;
  }
  #node(lineId: string, nodeId: string): CompiledStoryNode {
    const node = this.#compiled(lineId).nodes.get(nodeId);
    if (node === undefined) throw new TypeError(`STORY_CONTENT_NODE:${lineId}/${nodeId}`);
    return node;
  }
  #facts(): ConditionFacts {
    const base = deriveStoryFacts(this.#snapshot);
    const worldHour = floorDivInt(this.#snapshot.nowTick % (24 * 600), 600);
    const period = worldHour >= 5 && worldHour < 7 ? 'dawn'
      : worldHour >= 7 && worldHour < 17 ? 'day'
        : worldHour >= 17 && worldHour < 19 ? 'dusk' : 'night';
    const yearOffset = floorDivInt(this.#snapshot.nowTick, TICKS_PER_YEAR);
    return { ...base, time: { year: this.#clock.epochYear + yearOffset, period } };
  }
  #rebuildDeadlines(): void {
    for (const line of this.#snapshot.lines) for (const nodeId of line.activeNodeIds) {
      const window = line.resolvedWindows[nodeId];
      if (window !== undefined) {
        if (window.opensAtTick > this.#snapshot.nowTick) this.#deadlines.push({
          atTick: window.opensAtTick, lineId: line.lineId, nodeId, kind: 'open' });
        this.#deadlines.push({ atTick: window.closesAtTick, lineId: line.lineId, nodeId });
      }
    }
    for (const [lineId, window] of Object.entries(this.#snapshot.lineWindows)) {
      if (window.opensAtTick > this.#snapshot.nowTick) this.#deadlines.push({
        atTick: window.opensAtTick, lineId, nodeId: '@line', kind: 'open' });
      this.#deadlines.push({ atTick: window.closesAtTick, lineId, nodeId: '@line' });
    }
  }
  #resolveLineWindow(lineId: string): ReturnType<typeof resolveWindow> {
    const compiled = this.#compiled(lineId);
    if (compiled.triggerWindow === undefined) return undefined;
    const current = this.#snapshot.lineWindows[lineId];
    const resolved = resolveWindow(this.#snapshot, lineId, '@line', compiled.triggerWindow,
      this.#clock, current);
    if (resolved !== undefined && current === undefined) {
      this.#snapshot = { ...this.#snapshot, lineWindows: {
        ...this.#snapshot.lineWindows, [lineId]: resolved,
      } };
      if (resolved.opensAtTick > this.#snapshot.nowTick) this.#deadlines.push({
        atTick: resolved.opensAtTick, lineId, nodeId: '@line', kind: 'open' });
      this.#deadlines.push({ atTick: resolved.closesAtTick, lineId, nodeId: '@line' });
    }
    return resolved;
  }
  #enter(lineId: string, nodeId: string, events: StoryEvent[]): boolean {
    const node = this.#node(lineId, nodeId).node; let line = findLine(this.#snapshot, lineId);
    if (line.completedNodeIds.includes(nodeId) || line.expiredNodeIds.includes(nodeId)) return false;
    const receipt = `${lineId}/${nodeId}/entered`;
    if (line.activeNodeIds.includes(nodeId) &&
        Object.hasOwn(this.#snapshot.eventTicks, receipt)) return false;
    const window = node.timeWindow === undefined ? undefined : resolveWindow(this.#snapshot, lineId, nodeId,
      node.timeWindow, this.#clock, line.resolvedWindows[nodeId]);
    if (node.timeWindow !== undefined && window === undefined)
      throw new TypeError(`STORY_WINDOW_ANCHOR:${lineId}/${nodeId}`);
    const resolvedWindows = window === undefined ? line.resolvedWindows
      : { ...line.resolvedWindows, [nodeId]: window };
    line = updateLine(line, { status: 'active', activeNodeIds: [nodeId], resolvedWindows });
    this.#snapshot = replaceLine({ ...this.#snapshot, eventTicks: {
      ...this.#snapshot.eventTicks, [receipt]: this.#snapshot.nowTick,
    } }, line);
    if (window !== undefined) {
      if (window.opensAtTick > this.#snapshot.nowTick)
        this.#deadlines.push({ atTick: window.opensAtTick, lineId, nodeId, kind: 'open' });
      this.#deadlines.push({ atTick: window.closesAtTick, lineId, nodeId });
    }
    events.push(event('story/nodeEntered', lineId, nodeId, receipt, this.#snapshot.chapterId));
    return true;
  }
  #complete(lineId: string, nodeId: string, events: StoryEvent[], choiceKey?: string): void {
    let line = findLine(this.#snapshot, lineId); const receipt = nodeReceipt(lineId, nodeId);
    if (line.appliedEffectIds.includes(receipt)) return;
    const completedNodeIds = addUnique(line.completedNodeIds, nodeId);
    const chosenOptions = choiceKey === undefined ? line.chosenOptions
      : { ...line.chosenOptions, [nodeId]: choiceKey };
    line = updateLine(line, { activeNodeIds: [], completedNodeIds, chosenOptions,
      appliedEffectIds: addUnique(line.appliedEffectIds, receipt) });
    this.#snapshot = replaceLine({ ...this.#snapshot, eventTicks: {
      ...this.#snapshot.eventTicks, [receipt]: this.#snapshot.nowTick,
    } }, line);
    if (choiceKey !== undefined) events.push(event('story/choiceCommitted', lineId, nodeId,
      `${lineId}/${nodeId}/choice/${choiceKey}`, this.#snapshot.chapterId, { choiceKey }));
    events.push(event('story/nodeCompleted', lineId, nodeId, receipt, this.#snapshot.chapterId));
    this.#unlockSideHooks(lineId, nodeId, events);
  }
  #unlockSideHooks(lineId: string, nodeId: string, events: StoryEvent[]): void {
    const facts = this.#facts();
    for (const hook of this.#compiled(lineId).sideHooks) {
      if (hook.atNodeId !== nodeId || !hook.condition(facts)) continue;
      const target = this.#snapshot.lines.find((line) => line.lineId === hook.lineId);
      if (target === undefined) {
        if (!hook.optional) throw new TypeError(`STORY_HOOK_LINE:${hook.lineId}`);
        continue;
      }
      if (target.status !== 'locked') continue;
      const next = updateLine(target, { status: 'available' });
      this.#snapshot = replaceLine(this.#snapshot, next);
      events.push(event('story/lineAvailable', hook.lineId,
        this.#compiled(hook.lineId).line.startNodeId, `${lineId}/${nodeId}/unlock/${hook.lineId}`,
        this.#snapshot.chapterId));
      const window = this.#resolveLineWindow(hook.lineId);
      if (window !== undefined && window.closesAtTick <= this.#snapshot.nowTick)
        this.#expireLine(hook.lineId, events);
    }
  }
  #next(lineId: string, nodeId: string, choiceKey?: string, timeout = false): string | undefined {
    const facts = this.#facts();
    const edges = this.#node(lineId, nodeId).outgoing;
    let matching;
    if (timeout) matching = edges.find(({ edge }) => edge.trigger === 'timeout');
    else if (choiceKey !== undefined) matching = edges.find(({ edge }) =>
      edge.trigger === 'choice' && edge.choiceKey === choiceKey);
    else matching = edges.find(({ edge, condition }) =>
      edge.trigger === 'condition' && (condition?.(facts) ?? false)) ??
      edges.find(({ edge }) => edge.trigger === 'auto');
    if (matching === undefined) return undefined;
    const line = findLine(this.#snapshot, lineId);
    this.#snapshot = replaceLine(this.#snapshot, updateLine(line, {
      branchPath: [...line.branchPath, matching.edge.id],
    }));
    return matching.edge.to;
  }
  #finishEnd(lineId: string, nodeId: string, tags: readonly string[], events: StoryEvent[]): void {
    const line = findLine(this.#snapshot, lineId);
    this.#snapshot = replaceLine({ ...this.#snapshot, endingTags: [...this.#snapshot.endingTags, ...tags] },
      updateLine(line, { status: 'completed', activeNodeIds: [] }));
    events.push(event('story/lineCompleted', lineId, nodeId, `${lineId}/${nodeId}/ending`,
      this.#snapshot.chapterId, { endingTags: tags }));
    this.#restoreSuspendedWait();
  }
  #restoreSuspendedWait(): void {
    if (this.#snapshot.wait !== null || this.#snapshot.suspendedWaits.length === 0) return;
    const suspendedWaits = [...this.#snapshot.suspendedWaits];
    const wait = suspendedWaits.pop()!;
    this.#snapshot = { ...this.#snapshot, wait, suspendedWaits };
  }
  #stabilize(events: StoryEvent[]): void {
    let guard = 0;
    while (this.#snapshot.wait === null && guard < 1_000) {
      guard += 1;
      const suspended = new Set(this.#snapshot.suspendedWaits.map(
        (wait) => `${wait.lineId}/${wait.nodeId}`,
      ));
      const candidates = this.#snapshot.lines.filter((line) => line.status === 'active' &&
        line.activeNodeIds.length > 0 &&
        !suspended.has(`${line.lineId}/${line.activeNodeIds[0]!}`))
        .sort((left, right) => compareCodePoints(left.lineId, right.lineId));
      const facts = this.#facts();
      const active = candidates.find((line) => {
        const node = this.#node(line.lineId, line.activeNodeIds[0]!);
        const window = line.resolvedWindows[node.node.id];
        if (window !== undefined && this.#snapshot.nowTick < window.opensAtTick) return false;
        return node.node.type !== 'condition' || (node.gate?.(facts) ?? false);
      });
      if (active === undefined) return;
      const nodeId = active.activeNodeIds[0]!; const compiled = this.#node(active.lineId, nodeId);
      const window = active.resolvedWindows[nodeId];
      if (window !== undefined && this.#snapshot.nowTick >= window.closesAtTick) {
        this.#expire(active.lineId, nodeId, events); continue;
      }
      const execution = executeNode(this.#snapshot, active.lineId, compiled, this.#ports, facts);
      this.#snapshot = { ...execution.snapshot, wait: execution.wait };
      if (!execution.completes) return;
      this.#complete(active.lineId, nodeId, events);
      if (execution.endingTags !== undefined) {
        this.#finishEnd(active.lineId, nodeId, execution.endingTags, events); continue;
      }
      const target = this.#next(active.lineId, nodeId);
      if (target === undefined || !this.#enter(active.lineId, target, events)) return;
    }
    if (guard >= 1_000) throw new TypeError('STORY_STABILIZE_LIMIT');
  }
  #expire(lineId: string, nodeId: string, events: StoryEvent[]): void {
    const compiled = this.#node(lineId, nodeId); const window = compiled.node.timeWindow;
    if (window === undefined) return;
    let line = findLine(this.#snapshot, lineId);
    const resolved = line.resolvedWindows[nodeId];
    if (resolved === undefined || resolved.closesAtTick > this.#snapshot.nowTick ||
        !line.activeNodeIds.includes(nodeId)) return;
    if (window.onMiss.policy === 'defer' && resolved.defersUsed < window.onMiss.maxDefers) {
      const shift = window.onMiss.deferByMinutes * TICKS_PER_MINUTE;
      const deferred = { opensAtTick: resolved.opensAtTick,
        closesAtTick: resolved.closesAtTick + shift, defersUsed: resolved.defersUsed + 1 };
      line = updateLine(line, { resolvedWindows: { ...line.resolvedWindows, [nodeId]: deferred } });
      this.#snapshot = replaceLine(this.#snapshot, line);
      this.#deadlines.push({ atTick: deferred.closesAtTick, lineId, nodeId }); return;
    }
    line = updateLine(line, { activeNodeIds: [], expiredNodeIds: addUnique(line.expiredNodeIds, nodeId),
      status: window.onMiss.policy === 'expire' ? 'expired' : line.status });
    const isWait = (wait: StoryRuntimeSnapshot['wait']): boolean =>
      wait?.lineId === lineId && wait.nodeId === nodeId;
    const wait = isWait(this.#snapshot.wait) ? null : this.#snapshot.wait;
    const suspendedWaits = this.#snapshot.suspendedWaits.filter((entry) => !isWait(entry));
    this.#snapshot = replaceLine({ ...this.#snapshot, wait, suspendedWaits }, line);
    events.push(event('story/nodeExpired', lineId, nodeId, `${lineId}/${nodeId}/expired`,
      this.#snapshot.chapterId, { policy: window.onMiss.policy }));
    if (window.onMiss.policy === 'alternate') {
      const target = this.#next(lineId, nodeId, undefined, true);
      if (target === undefined) throw new TypeError(`STORY_TIMEOUT_EDGE:${lineId}/${nodeId}`);
      this.#enter(lineId, target, events);
    }
    if (window.onMiss.policy === 'expire') this.#restoreSuspendedWait();
  }
  #expireLine(lineId: string, events: StoryEvent[]): void {
    const state = findLine(this.#snapshot, lineId);
    const window = this.#compiled(lineId).triggerWindow;
    const resolved = this.#snapshot.lineWindows[lineId];
    if (window === undefined || resolved === undefined || resolved.closesAtTick > this.#snapshot.nowTick ||
        (state.status !== 'locked' && state.status !== 'available')) return;
    if (window.onMiss.policy === 'defer' && resolved.defersUsed < window.onMiss.maxDefers) {
      const shift = window.onMiss.deferByMinutes * TICKS_PER_MINUTE;
      const deferred = { opensAtTick: resolved.opensAtTick,
        closesAtTick: resolved.closesAtTick + shift, defersUsed: resolved.defersUsed + 1 };
      this.#snapshot = { ...this.#snapshot, lineWindows: {
        ...this.#snapshot.lineWindows, [lineId]: deferred } };
      this.#deadlines.push({ atTick: deferred.closesAtTick, lineId, nodeId: '@line' }); return;
    }
    const alternateTarget = window.onMiss.policy === 'alternate'
      ? window.onMiss.targetNodeId : undefined;
    this.#snapshot = replaceLine(this.#snapshot, updateLine(state, {
      status: alternateTarget === undefined ? 'expired' : 'active',
    }));
    events.push(event('story/nodeExpired', lineId, '@line', `${lineId}/expired`,
      this.#snapshot.chapterId, { policy: window.onMiss.policy }));
    if (alternateTarget !== undefined) this.#enter(lineId, alternateTarget, events);
  }
  public start(): StoryStepResult {
    const events: StoryEvent[] = []; const main = this.#compiled('main');
    const state = findLine(this.#snapshot, 'main');
    if (state.activeNodeIds.length === 0 && state.completedNodeIds.length === 0)
      this.#enter('main', main.line.startNodeId, events);
    else if (state.activeNodeIds.length > 0 &&
        !Object.hasOwn(this.#snapshot.eventTicks, `${state.lineId}/${state.activeNodeIds[0]!}/entered`))
      this.#enter(state.lineId, state.activeNodeIds[0]!, events);
    this.#stabilize(events); return { snapshot: this.snapshot(), events };
  }
  public activateLine(lineId: string): StoryStepResult {
    const events: StoryEvent[] = []; const state = findLine(this.#snapshot, lineId);
    if (state.status !== 'available') return { snapshot: this.snapshot(), events };
    const compiled = this.#compiled(lineId);
    if (compiled.triggerCondition !== undefined &&
        !compiled.triggerCondition(this.#facts()))
      return { snapshot: this.snapshot(), events };
    const window = this.#resolveLineWindow(lineId);
    if (compiled.triggerWindow !== undefined && window === undefined)
      return { snapshot: this.snapshot(), events };
    if (window !== undefined && this.#snapshot.nowTick < window.opensAtTick)
      return { snapshot: this.snapshot(), events };
    if (window !== undefined && this.#snapshot.nowTick >= window.closesAtTick) {
      this.#expireLine(lineId, events); this.#stabilize(events);
      return { snapshot: this.snapshot(), events };
    }
    const priorWait = this.#snapshot.wait;
    if (priorWait !== null) this.#snapshot = { ...this.#snapshot, wait: null,
      suspendedWaits: [...this.#snapshot.suspendedWaits, priorWait] };
    if (!this.#enter(lineId, compiled.line.startNodeId, events) && priorWait !== null) {
      this.#snapshot = { ...this.#snapshot, wait: priorWait,
        suspendedWaits: this.#snapshot.suspendedWaits.slice(0, -1) };
    }
    this.#stabilize(events); return { snapshot: this.snapshot(), events };
  }
  public chooseDialogue(choiceKey: string): StoryStepResult {
    const wait = this.#snapshot.wait; const bridge = this.#ports.dialogue;
    if (wait?.kind !== 'dialogue' || bridge === undefined)
      throw new TypeError('STORY_WAIT_DIALOGUE');
    const session = bridge.choose(wait.session, choiceKey);
    this.#snapshot = { ...this.#snapshot, wait: { ...wait, session } };
    return { snapshot: this.snapshot(), events: [] };
  }
  public completeDialogue(): StoryStepResult {
    if (this.#snapshot.wait?.kind === 'dialogue' && this.#snapshot.wait.session.choices.length > 0)
      throw new TypeError('STORY_DIALOGUE_CHOICE_PENDING');
    return this.#resume('dialogue');
  }
  public completeQuest(questId: string): StoryStepResult {
    return this.#resolveQuest(questId, 'completed');
  }
  public failQuest(questId: string): StoryStepResult {
    return this.#resolveQuest(questId, 'failed');
  }
  #resolveQuest(questId: string, status: 'completed' | 'failed'): StoryStepResult {
    const wait = this.#snapshot.wait;
    if (wait?.kind !== 'quest' || wait.questId !== questId)
      throw new TypeError('STORY_WAIT_QUEST');
    return this.#resume('quest', status);
  }
  public choose(choiceKey: string): StoryStepResult {
    const wait = this.#snapshot.wait;
    if (wait?.kind !== 'choice' || !wait.options.includes(choiceKey))
      throw new TypeError('STORY_CHOICE');
    const events: StoryEvent[] = []; this.#snapshot = { ...this.#snapshot, wait: null };
    this.#complete(wait.lineId, wait.nodeId, events, choiceKey);
    const target = this.#next(wait.lineId, wait.nodeId, choiceKey);
    if (target === undefined) throw new TypeError('STORY_CHOICE_EDGE');
    this.#enter(wait.lineId, target, events); this.#stabilize(events);
    return { snapshot: this.snapshot(), events };
  }
  #resume(kind: 'dialogue' | 'quest', questStatus: 'completed' | 'failed' = 'completed'): StoryStepResult {
    const wait = this.#snapshot.wait;
    if (wait?.kind !== kind) throw new TypeError(`STORY_WAIT_${kind}`);
    const events: StoryEvent[] = []; this.#snapshot = { ...this.#snapshot, wait: null };
    if (wait.kind === 'quest') {
      this.#snapshot = { ...this.#snapshot, facts: { ...this.#snapshot.facts, quests: {
        ...this.#snapshot.facts.quests, [wait.questId]: questStatus,
      } }, eventTicks: { ...this.#snapshot.eventTicks,
        [`quest/${questStatus === 'completed' ? 'succeeded' : 'failed'}/${wait.questId}`]:
          this.#snapshot.nowTick } };
    }
    this.#complete(wait.lineId, wait.nodeId, events);
    const target = this.#next(wait.lineId, wait.nodeId);
    if (target !== undefined) this.#enter(wait.lineId, target, events);
    this.#stabilize(events); return { snapshot: this.snapshot(), events };
  }
  public advanceTo(nowTick: number): StoryStepResult {
    if (!Number.isSafeInteger(nowTick) || nowTick < this.#snapshot.nowTick)
      throw new TypeError('STORY_TIME');
    const events: StoryEvent[] = [];
    while (this.#deadlines.peek() !== undefined && this.#deadlines.peek()!.atTick <= nowTick) {
      const atTick = this.#deadlines.peek()!.atTick;
      this.#snapshot = { ...this.#snapshot, nowTick: atTick };
      while (this.#deadlines.peek()?.atTick === atTick) {
        const due = this.#deadlines.pop()!;
        if (due.kind === 'open') continue;
        if (due.nodeId === '@line') this.#expireLine(due.lineId, events);
        else this.#expire(due.lineId, due.nodeId, events);
      }
      this.#stabilize(events);
    }
    this.#snapshot = { ...this.#snapshot, nowTick };
    this.#stabilize(events); return { snapshot: this.snapshot(), events };
  }
}

export function restoreStoryRuntime(
  lines: readonly StoryLine[], snapshot: StoryRuntimeSnapshot, ports?: StoryRuntimePorts,
  clock?: { readonly epochId?: string; readonly epochYear?: number },
): StoryRuntime {
  return new StoryRuntime(lines, { snapshot, nowTick: snapshot.nowTick,
    ...(clock?.epochId === undefined ? {} : { epochId: clock.epochId }),
    ...(clock?.epochYear === undefined ? {} : { epochYear: clock.epochYear }),
    ...(ports === undefined ? {} : { ports }) });
}

export function storyLineState(runtime: StoryRuntime, lineId: string): StoryLineState {
  return findLine(runtime.snapshot(), lineId);
}
