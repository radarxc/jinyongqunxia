import { compareCodePoints } from '@tianshu/shared';

export type ReactionKind = 'parry' | 'counter' | 'formationCounter' | 'followup';
export interface ReactionRequest { readonly id: string; readonly kind: ReactionKind;
  readonly unitId: string; readonly unitIndex: number; readonly depth: number; readonly priority: number }

const KIND_RANK: Readonly<Record<ReactionKind, number>> =
  { parry: 0, counter: 1, formationCounter: 2, followup: 3 };

export function enqueueReaction(
  queue: ReactionRequest[], request: ReactionRequest, maxDepth = 3,
): boolean {
  if (request.depth > maxDepth) return false;
  queue.push(request);
  queue.sort((left, right) => left.depth - right.depth || left.priority - right.priority
    || KIND_RANK[left.kind] - KIND_RANK[right.kind] || left.unitIndex - right.unitIndex
    || compareCodePoints(left.id, right.id));
  return true;
}

export function takeReaction(queue: ReactionRequest[]): ReactionRequest | null {
  return queue.shift() ?? null;
}
