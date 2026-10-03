import type { RegionAnchorView, RegionHexDir, RegionHexPoint } from '@tianshu/render/region';

const DIRECTIONS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
] as const;
const DIRECTION_YAWS = [0, 300, 240, 180, 120, 60] as const;
const SCREEN_YAW_OFFSET: Readonly<Record<string, number>> = {
  ArrowRight: -90, d: -90, ArrowDown: 0, s: 0,
  ArrowLeft: 90, a: 90, ArrowUp: 180, w: 180,
};

function angularDistance(left: number, right: number): number {
  return Math.abs(((left - right + 540) % 360) - 180);
}

/** Converts screen-relative keyboard input to an axial neighbor; core still validates the move. */
export function regionKeyboardTarget(origin: RegionHexPoint, key: string, cameraYawDeg: number):
RegionHexPoint | null {
  const offset = SCREEN_YAW_OFFSET[key];
  if (offset === undefined || !Number.isFinite(cameraYawDeg)) return null;
  const desiredYaw = (cameraYawDeg + offset + 360) % 360;
  let direction = 0; let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < DIRECTION_YAWS.length; index += 1) {
    const candidate = angularDistance(desiredYaw, DIRECTION_YAWS[index]!);
    if (candidate < distance) { direction = index; distance = candidate; }
  }
  const delta = DIRECTIONS[direction]!;
  return { q: origin.q + delta.q, r: origin.r + delta.r };
}

export function regionFacing(from: RegionHexPoint, to: RegionHexPoint): RegionHexDir {
  const dq = Math.sign(to.q - from.q); const dr = Math.sign(to.r - from.r);
  const index = DIRECTIONS.findIndex((entry) => entry.q === dq && entry.r === dr);
  return (index < 0 ? 0 : index) as RegionHexDir;
}

export function regionAnchorLabel(anchor: RegionAnchorView): string {
  return { NpcSpawn: '交谈', Door: '进入', Trigger: '查看', QinggongGate: '施展轻功',
    Chest: '打开', BattleArena: '迎战' }[anchor.class] ?? '互动';
}

export function regionReason(reason: string | null): string {
  return reason ? `受阻：${reason}` : '';
}
