import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import type { StoryEdge, StoryLine, StoryNode, TimeWindow } from '@tianshu/data/schemas';
import { compileCondition, type ConditionProgram } from './condition';

export interface CompiledStoryEdge { readonly edge: StoryEdge; readonly condition?: ConditionProgram; }
export interface CompiledStoryNode {
  readonly node: StoryNode; readonly outgoing: readonly CompiledStoryEdge[];
  readonly gate?: ConditionProgram;
  readonly optionConditions: Readonly<Record<string, ConditionProgram>>;
}
export interface CompiledSideHook {
  readonly lineId: string; readonly atNodeId: string; readonly optional: boolean;
  readonly condition: ConditionProgram;
}
export interface CompiledStoryLine {
  readonly line: StoryLine; readonly nodes: ReadonlyMap<string, CompiledStoryNode>;
  readonly sideHooks: readonly CompiledSideHook[]; readonly triggerCondition?: ConditionProgram;
  readonly triggerWindow?: TimeWindow;
}

function compareEdges(left: StoryEdge, right: StoryEdge): number {
  return right.priority - left.priority || compareCodePoints(left.id, right.id);
}
function asJson(value: unknown): JsonValue { return value as JsonValue; }
function compileNode(node: StoryNode, outgoing: readonly StoryEdge[]): CompiledStoryNode {
  const optionConditions: Record<string, ConditionProgram> = {};
  if (node.type === 'choice') {
    for (const option of node.payload.options) {
      if (option.when !== undefined) optionConditions[option.key] = compileCondition(asJson(option.when));
    }
  }
  return { node, outgoing: [...outgoing].sort(compareEdges).map((edge) => ({ edge,
    ...(edge.trigger === 'condition'
      ? { condition: compileCondition(asJson(edge.condition)) } : {}) })),
    ...(node.type === 'condition'
      ? { gate: compileCondition(asJson(node.payload.expression)) } : {}),
    optionConditions };
}
export function compileStoryLine(line: StoryLine): CompiledStoryLine {
  const bySource = new Map<string, StoryEdge[]>();
  for (const edge of line.edges) {
    const bucket = bySource.get(edge.from) ?? []; bucket.push(edge); bySource.set(edge.from, bucket);
  }
  const nodes = new Map<string, CompiledStoryNode>();
  for (const node of line.nodes) nodes.set(node.id, compileNode(node, bySource.get(node.id) ?? []));
  const sideHooks = line.sideHooks.map((hook) => ({ lineId: hook.lineId,
    atNodeId: hook.atNodeId, optional: hook.optional ?? false,
    condition: compileCondition(asJson(hook.when)) }));
  return { line, nodes, sideHooks,
    ...(line.trigger?.timeWindow === undefined ? {} : { triggerWindow: line.trigger.timeWindow }),
    ...(line.trigger?.condition === undefined ? {}
      : { triggerCondition: compileCondition(asJson(line.trigger.condition)) }) };
}

export function compileStoryLines(lines: readonly StoryLine[]): readonly CompiledStoryLine[] {
  const ids = new Set<string>(); const compiled = lines.map(compileStoryLine);
  const main = compiled.filter(({ line }) => line.kind === 'main');
  if (main.length !== 1) throw new TypeError('STORY_MAIN_COUNT');
  const chapterId = main[0]!.line.chapterId;
  for (const entry of compiled) {
    if (entry.line.chapterId !== chapterId) throw new TypeError('STORY_CHAPTER_MISMATCH');
    if (ids.has(entry.line.lineId)) throw new TypeError(`STORY_LINE_DUPLICATE:${entry.line.lineId}`);
    ids.add(entry.line.lineId);
  }
  for (const entry of compiled) for (const hook of entry.sideHooks) {
    if (!ids.has(hook.lineId) && !hook.optional) throw new TypeError(`STORY_HOOK_LINE:${hook.lineId}`);
  }
  return compiled;
}

export function calendarTick(
  window: Extract<TimeWindow, { mode: 'absolute' }>, epochYear: number, ticksPerMinute: number,
): readonly [number, number] {
  if (window.epochId.length === 0) throw new TypeError('STORY_WINDOW_EPOCH');
  const ordinal = (value: typeof window.opensAt): number => {
    const day = ((value.year - epochYear) * 12 + value.month - 1) * 30 + value.day - 1;
    return ((day * 24 + value.hour) * 60 + value.minute) * ticksPerMinute;
  };
  return [ordinal(window.opensAt), ordinal(window.closesAt)];
}

