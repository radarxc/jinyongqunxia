import type { CoreTransaction } from '../../command';

export type ExploreTick = (tx: CoreTransaction) => void;

let registered: ExploreTick | undefined;

export function registerExploreTick(fn: ExploreTick): void {
  registered = fn;
}

export function exploreTickHook(): ExploreTick {
  if (!registered) throw new Error('EXPLORE_TICK_UNAVAILABLE');
  return registered;
}
