import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { z } from 'zod';
import { StoryLineShapeSchema, type StoryEdge, type StoryNode } from './story';

function validateGraph(nodes: readonly StoryNode[], edges: readonly StoryEdge[]): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  if (nodeIds.size !== nodes.length) errors.push('node IDs must be unique');
  const edgeIds = new Set(edges.map((edge) => edge.id));
  if (edgeIds.size !== edges.length) errors.push('edge IDs must be unique');
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, StoryEdge[]>();
  for (const node of nodes) { incoming.set(node.id, 0); outgoing.set(node.id, []); }
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) { errors.push(`unresolved edge ${edge.id}`); continue; }
    if (edge.from === edge.to) errors.push(`self edge ${edge.id}`);
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    outgoing.get(edge.from)!.push(edge);
  }
  for (const node of nodes) {
    const nodeEdges = outgoing.get(node.id) ?? [];
    const count = nodeEdges.length;
    if (node.type === 'end' ? count !== 0 : count === 0) errors.push(`invalid terminal degree ${node.id}`);
    if (node.type === 'choice') {
      const expected = [...node.payload.options.map((option) => option.key)].sort();
      const actual = (outgoing.get(node.id) ?? []).filter((edge) => edge.trigger === 'choice').map((edge) => edge.choiceKey).sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push(`choice edges mismatch ${node.id}`);
    }
    if ((node.type === 'condition' || node.type === 'merge') && count > 1) {
      const autoCount = nodeEdges.filter((edge) => edge.trigger === 'auto').length;
      let exhaustive = false;
      if (node.type === 'condition' && autoCount === 0 && nodeEdges.every((edge) => edge.trigger === 'condition')) {
        const alternatives = node.payload.expression['any'];
        if (Array.isArray(alternatives) && alternatives.length > 0) {
          const expected = alternatives.map((entry) => canonicalJson(entry as JsonValue)).sort();
          const actual = nodeEdges.map((edge) => canonicalJson(
            (edge as Extract<StoryEdge, { trigger: 'condition' }>).condition as JsonValue,
          )).sort();
          exhaustive = new Set(expected).size === expected.length &&
            new Set(actual).size === actual.length && JSON.stringify(actual) === JSON.stringify(expected);
        }
      }
      if (autoCount !== 1 && !exhaustive) errors.push(`multi-route node needs one auto fallback ${node.id}`);
    }
    if (node.timeWindow?.onMiss.policy === 'alternate') {
      const timeout = nodeEdges.filter((edge) => edge.trigger === 'timeout');
      if (timeout.length !== 1 || timeout[0]?.to !== node.timeWindow.onMiss.targetNodeId) errors.push(`timeout edge mismatch ${node.id}`);
    } else if (nodeEdges.some((edge) => edge.trigger === 'timeout')) {
      errors.push(`unexpected timeout edge ${node.id}`);
    }
  }
  const starts = nodes.filter((node) => incoming.get(node.id) === 0).map((node) => node.id);
  const visited = new Set<string>();
  const active = new Set<string>();
  const visit = (id: string): void => {
    if (active.has(id)) { errors.push(`cycle at ${id}`); return; }
    if (visited.has(id)) return;
    active.add(id);
    for (const edge of outgoing.get(id) ?? []) visit(edge.to);
    active.delete(id); visited.add(id);
  };
  if (starts.length === 1) visit(starts[0]!);
  if (starts.length !== 1) errors.push('graph must have exactly one zero-indegree node');
  if (visited.size !== nodes.length) errors.push('all nodes must be reachable');
  return errors;
}

export const StoryLineSchema = StoryLineShapeSchema.superRefine((value, context) => {
  if ((value.kind === 'main') !== (value.lineId === 'main')) context.addIssue({ code: 'custom', path: ['lineId'], message: 'main line identity mismatch' });
  const starts = new Map(value.nodes.map((node) => [node.id, 0]));
  for (const edge of value.edges) if (starts.has(edge.to)) starts.set(edge.to, starts.get(edge.to)! + 1);
  if (starts.get(value.startNodeId) !== 0) context.addIssue({ code: 'custom', path: ['startNodeId'], message: 'start node must have zero indegree' });
  if (value.kind === 'main') {
    const windows = [value.trigger?.timeWindow, ...value.nodes.map((node) => node.timeWindow)].filter((entry) => entry !== undefined);
    if (windows.some((window) => window.onMiss.policy === 'expire')) context.addIssue({ code: 'custom', path: ['nodes'], message: 'main line cannot expire' });
  }
  const nodeIds = new Set(value.nodes.map((node) => node.id));
  for (const hook of value.sideHooks) if (!nodeIds.has(hook.atNodeId))
    context.addIssue({ code: 'custom', path: ['sideHooks'], message: `unresolved hook node ${hook.atNodeId}` });
  for (const message of validateGraph(value.nodes, value.edges)) context.addIssue({ code: 'custom', path: ['edges'], message });
});

export type StoryLine = z.output<typeof StoryLineSchema>;
