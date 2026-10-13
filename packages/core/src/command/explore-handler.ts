import type { CommandHandler, CoreContent, RejectReason } from '.';
import type { GameState } from '../state';
import type { RegionRuntimeContent } from '../world';
import { prepareExploreTravel } from '../world/explore/walk';
import { exploreMap, exploreObjectIndex } from '../world/explore/walk-validate';
import type { ExploreCommand, ExploreWalkState } from '../world/explore/types';

function busy(state: Readonly<GameState>): boolean {
  return state.dialogue !== null || state.battle !== null ||
    state.world.pendingTimeAdvance !== null || state.world.navigation.pendingMount !== null;
}

function region(content: CoreContent): RegionRuntimeContent | null {
  return content.region ?? null;
}

function invalid(state: Readonly<GameState>, command: ExploreCommand, content: CoreContent):
  RejectReason | null {
  if (busy(state)) return 'REGION_INTERACTION_BUSY';
  const mounted = state.world.navigation.mountedRegion;
  if (!mounted) return command.t === 'world/stop' || command.t === 'world/steer'
    ? null : 'REGION_PATH_BLOCKED';
  const runtime = region(content);
  if (!runtime) return 'REGION_UNAVAILABLE';
  const map = exploreMap(runtime, state.world.navigation.locationId);
  if (!map || map.regionId !== mounted.regionId) return 'REGION_CONTENT_MISMATCH';
  if (command.t === 'world/travelTo') {
    if (command.target.kind === 'hex') return Number.isSafeInteger(command.target.hex.q) &&
      Number.isSafeInteger(command.target.hex.r) ? null : 'REGION_PATH_NOT_STANDABLE';
    const object = exploreObjectIndex(map).get(command.target.kind === 'anchor'
      ? command.target.anchorId : command.target.buildingId);
    if (!object || command.target.kind === 'building' && object.class !== 'Building')
      return 'REGION_ANCHOR_UNKNOWN';
  }
  if (command.t === 'world/meditate') return 'REGION_INTERACTION_UNSUPPORTED';
  return null;
}

function stopWalk(tx: Parameters<CommandHandler<ExploreCommand>['apply']>[0]): void {
  const walk = tx.state.world.navigation.mountedRegion?.walk;
  if (!walk) return;
  if (walk.progressMm === 0 || walk.path.length < 2) {
    tx.set(['world', 'navigation', 'mountedRegion', 'walk'], null);
    return;
  }
  if (walk.path.length > 2)
    tx.splice(['world', 'navigation', 'mountedRegion', 'walk', 'path'], 2, walk.path.length - 2, []);
  tx.set(['world', 'navigation', 'mountedRegion', 'walk', 'steer'], null);
  tx.set(['world', 'navigation', 'mountedRegion', 'walk', 'goal'], { kind: 'hex' });
}

function steer(tx: Parameters<CommandHandler<ExploreCommand>['apply']>[0],
  command: Extract<ExploreCommand, { t: 'world/steer' }>): void {
  const mounted = tx.state.world.navigation.mountedRegion;
  if (!mounted) return;
  const current = mounted.walk;
  if (command.dir === null) { stopWalk(tx); return; }
  if (!current) {
    const walk: ExploreWalkState = { path: [{ ...mounted.playerHex }], progressMm: 0,
      pace: command.pace ?? 'walk', steer: command.dir, goal: { kind: 'hex' } };
    tx.set(['world', 'navigation', 'mountedRegion', 'walk'], walk);
    return;
  }
  const keep = current.progressMm > 0 && current.path[1] ? 2 : 1;
  if (current.path.length > keep)
    tx.splice(['world', 'navigation', 'mountedRegion', 'walk', 'path'], keep,
      current.path.length - keep, []);
  tx.set(['world', 'navigation', 'mountedRegion', 'walk', 'steer'], command.dir);
  tx.set(['world', 'navigation', 'mountedRegion', 'walk', 'goal'], { kind: 'hex' });
  if (command.pace !== undefined)
    tx.set(['world', 'navigation', 'mountedRegion', 'walk', 'pace'], command.pace);
}

export const exploreHandler: CommandHandler<ExploreCommand> = {
  noop(state, command) {
    const noWalk = (state.world.navigation.mountedRegion?.walk ?? null) === null;
    return noWalk && (command.t === 'world/stop' || command.t === 'world/steer' &&
      (command.dir === null || state.world.navigation.mountedRegion === null)) && !busy(state);
  },
  validate: invalid,
  apply(tx, command) {
    if (command.t === 'world/stop') { stopWalk(tx); return; }
    if (command.t === 'world/steer') { steer(tx, command); return; }
    if (command.t === 'world/meditate') { tx.abort('REGION_INTERACTION_UNSUPPORTED'); return; }
    const runtime = region(tx.content);
    if (!runtime) { tx.abort('REGION_UNAVAILABLE'); return; }
    const prepared = prepareExploreTravel(tx.state, runtime, command.target, command.pace,
      command.thenInteract ?? false);
    if (!prepared) { tx.abort('REGION_PATH_UNREACHABLE'); return; }
    tx.set(['world', 'navigation', 'mountedRegion', 'walk'], prepared.walk);
  },
};
