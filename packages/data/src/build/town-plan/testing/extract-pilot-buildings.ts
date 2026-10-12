import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import type { LayoutBuildingInput, PlanningFrame } from '../types';

interface SourceBuilding {
  readonly id: string;
  readonly type: string;
  readonly origin: { readonly x: number; readonly z: number };
  readonly size: { readonly w: number; readonly h: number };
  readonly entrance_cells: readonly { readonly x: number; readonly z: number }[];
}
interface SourceLayout {
  readonly grid: { readonly height: number };
  readonly buildings: readonly SourceBuilding[];
}
interface PilotScene {
  readonly sceneId: string;
  readonly kitId: 'song_dali' | 'xiyu';
  readonly variant?: 'tang_buddhist';
  readonly frame: PlanningFrame;
  readonly buildings: readonly LayoutBuildingInput[];
}

const ROOT = resolve(import.meta.dirname, '../../../../../..');
const SOURCES = [
  ['city_dali__ch01', 'song_dali', undefined,
    'assets/default/baseline/town/town_dali__ch01.layout.yaml'],
  ['city_dali__ch10', 'song_dali', undefined,
    'assets/default/town/city_dali__ch10/layout.yaml'],
  ['city_turpan__ch10', 'xiyu', 'tang_buddhist',
    'assets/default/town/city_turpan__ch10/layout.yaml'],
] as const;

function enterable(type: string): boolean {
  return !type.includes('market_stall') && !type.includes('pagoda') && !type.includes('wharf');
}

function extract(
  sceneId: string, kitId: 'song_dali' | 'xiyu', variant: 'tang_buddhist' | undefined,
  sourcePath: string,
): PilotScene {
  const source = parse(readFileSync(resolve(ROOT, sourcePath), 'utf8')) as SourceLayout;
  const buildings = source.buildings.map((row): LayoutBuildingInput => {
    const entrance = row.entrance_cells[0];
    if (entrance === undefined || row.entrance_cells.length !== 1) {
      throw new TypeError(`PILOT_ENTRANCE_COUNT:${sceneId}:${row.id}`);
    }
    return {
      id: row.id, type: row.type, originCell: [row.origin.x, row.origin.z],
      sizeCells: [row.size.w, row.size.h], entranceCell: [entrance.x, entrance.z],
      enterable: enterable(row.type), baseYMm: 0,
    };
  });
  return {
    sceneId, kitId, ...(variant === undefined ? {} : { variant }),
    frame: { heightCells: source.grid.height, originXMm: 0, originZMm: 0 }, buildings,
  };
}

function format(scenes: readonly PilotScene[]): string {
  const lines = ['{"scenes":['];
  scenes.forEach((scene, sceneIndex) => {
    const heading = { sceneId: scene.sceneId, kitId: scene.kitId,
      ...(scene.variant === undefined ? {} : { variant: scene.variant }), frame: scene.frame };
    lines.push(`${sceneIndex === 0 ? '' : ','}${JSON.stringify(heading).slice(0, -1)},"buildings":[`);
    scene.buildings.forEach((building, index) => {
      lines.push(`${index === 0 ? '' : ','}${JSON.stringify(building)}`);
    });
    lines.push(']}');
  });
  lines.push(']}', '');
  return lines.join('\n');
}

const scenes = SOURCES.map(([sceneId, kitId, variant, sourcePath]) =>
  extract(sceneId, kitId, variant, sourcePath));
writeFileSync(resolve(import.meta.dirname, 'pilot-buildings.json'), format(scenes), 'utf8');
