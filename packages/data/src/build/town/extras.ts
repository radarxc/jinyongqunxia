import { compareCodePoints } from '@tianshu/shared';
import type { RegionObject } from '../../schemas/region-map';
import { isInteriorCell } from './geometry';
import { planningPointMm } from '../town-plan';
import { cellCentreMm } from './frame';
import type { TownWork } from './types';

function meditationObject(
  work: TownWork,
  buildingId: string,
  riskBaseBp: number,
): RegionObject | undefined {
  const plan = work.plans.find(({ id }) => id === buildingId);
  if (plan === undefined) return undefined;
  const cell = [...work.cells.values()]
    .filter((entry) => isInteriorCell(plan, entry))
    .sort((a, b) => a.r - b.r || a.q - b.q)[0];
  if (cell === undefined) return undefined;
  return {
    id: `meditation_${buildingId}`,
    class: 'MeditationSpot',
    q: cell.q,
    r: cell.r,
    h: cell.height,
    cells: [{ q: cell.q, r: cell.r, h: cell.height }],
    buildingId,
    riskBaseBp,
    quality: riskBaseBp === 250 ? 2 : 1,
  };
}

export function compileExtras(
  work: TownWork,
): Map<string, readonly { readonly id: string; readonly index: number }[]> {
  for (const facility of work.input.facilities.facilities) {
    if (facility.kind !== 'inn' && facility.kind !== 'temple') continue;
    const object = meditationObject(work, facility.buildingId, facility.kind === 'inn' ? 100 : 250);
    if (object !== undefined) work.objects.push(object);
  }
  const byChunk = new Map<string, { id: string; index: number }[]>();
  const cells = [...work.cells.values()];
  for (const decoration of [...work.input.layout.decorations].sort((a, b) =>
    compareCodePoints(a.id, b.id),
  )) {
    const target = planningPointMm(work.frame, decoration.at.x, decoration.at.z);
    let cell = cells[0]!;
    let score = Number.MAX_SAFE_INTEGER;
    for (const candidate of cells) {
      const [x, z] = cellCentreMm(candidate);
      const dx = x - target[0];
      const dz = z - target[1];
      const next = dx * dx + dz * dz;
      if (next < score) {
        cell = candidate;
        score = next;
      }
    }
    const key = `${Math.floor(cell.q / 32)},${Math.floor(cell.r / 32)}`;
    const list = byChunk.get(key) ?? [];
    const index = (cell.r % 32) * 32 + (cell.q % 32);
    if (!list.some((entry) => entry.index === index)) list.push({ id: decoration.asset_id, index });
    byChunk.set(key, list);
  }
  for (const list of byChunk.values()) list.sort((a, b) => a.index - b.index);
  return byChunk;
}
