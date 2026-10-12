import type { DataTexture } from 'three';

export const CUTAWAY_SECONDS = 0.25;
export interface BuildingState {
  mode: 0 | 1 | 2;
  roof: number;
  wall: number;
  interior: number;
}

export function createBuildingStates(units: number): BuildingState[] {
  return Array.from({ length: units }, () => ({ mode: 0, roof: 1, wall: 0, interior: 0 }));
}
function move(value: number, target: number, step: number): number {
  if (value === target) return value;
  return target < value ? Math.max(target, value - step) : Math.min(target, value + step);
}
export function advanceBuildingStates(
  states: readonly BuildingState[],
  stateData: Uint8Array,
  texture: DataTexture,
  dt: number,
  reducedMotion: boolean,
  windowLight: boolean,
): void {
  const step = reducedMotion ? 1 : (dt > 0 ? dt : 0) / CUTAWAY_SECONDS;
  let dirty = false;
  for (let unit = 0; unit < states.length; unit += 1) {
    const state = states[unit]!;
    const roofTarget = state.mode === 0 ? 1 : 0;
    const wallTarget = state.mode === 2 ? 1 : 0;
    const interiorTarget = state.mode === 0 ? 0 : 1;
    const roof = move(state.roof, roofTarget, step);
    const wall = move(state.wall, wallTarget, step);
    const interior = move(state.interior, interiorTarget, step);
    if (roof !== state.roof || wall !== state.wall || interior !== state.interior) dirty = true;
    state.roof = roof;
    state.wall = wall;
    state.interior = interior;
    const offset = unit * 4;
    stateData[offset] = Math.round(roof * 255);
    stateData[offset + 1] = Math.round(wall * 255);
    // B=1 is reserved for closed-interior night windows; B>=2 is cutaway visibility.
    const blue = Math.max(Math.round(interior * 255), windowLight ? 1 : 0);
    if (stateData[offset + 2] !== blue) dirty = true;
    stateData[offset + 2] = blue;
  }
  if (dirty) {
    texture.version += 1;
    texture.source.version += 1;
  }
}

export function accessoryVisible(
  states: readonly BuildingState[],
  unit: number,
  side: number,
  facadeMask: number,
): boolean {
  return states[unit]?.mode !== 2 || (facadeMask & (1 << side)) === 0;
}
