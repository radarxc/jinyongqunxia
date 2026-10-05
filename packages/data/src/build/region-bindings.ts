import { compareCodePoints } from '@tianshu/shared';
import type { ContentRegistry } from '../content-index';
import type { RegionDialogueBindingDef, RegionGateBindingDef, RegionLootBindingDef } from '../schemas';
import type { CompiledRegionMap } from './tiled-types';
import type { Diagnostic } from './types';

const span = (file: string) => ({ file, line: 1, column: 1, endLine: 1, endColumn: 1 });
const diagnostic = (file: string, message: string): Diagnostic => ({
  code: 'TS-CONTENT-MAP-019', severity: 'error', message, primary: span(file),
});
const availableIn = (map: CompiledRegionMap, chapter: string): boolean =>
  map.chapterScopes.includes('all') || map.chapterScopes.includes(chapter);

/** Closes authored region bindings against compiled map objects in both directions. */
export function validateRegionBindingMaps(
  maps: readonly CompiledRegionMap[], registry: ContentRegistry,
): Diagnostic[] {
  const validMaps = maps.filter((map) =>
    !map.diagnostics.some((entry) => entry.severity === 'error'));
  const gateById = new Map(registry.regionGates.map((row) => [row.gateId, row]));
  const lootById = new Map(registry.regionLoot.map((row) => [row.lootRef, row]));
  const dialogueByAnchor = new Map(registry.regionDialogues.map((row) =>
    [`${row.chapter}/${row.sceneId}/${row.anchorId}`, row]));
  const declaredChapters = new Set(registry.entries.flatMap((entry) => {
    const match = entry.path.match(new RegExp('^content/chapters/([^/]+)/bindings/', 'u'));
    return match === null ? [] : [match[1]!];
  }));
  const diagnostics: Diagnostic[] = [];

  for (const map of validMaps) for (const object of map.objects) {
    if (object.class === 'Door' && object.lockedBy !== undefined) {
      const binding = gateById.get(object.lockedBy);
      if (binding === undefined || !availableIn(map, binding.chapter))
        diagnostics.push(diagnostic(map.source.path,
          `${object.id} lockedBy ${object.lockedBy} is not registered for this map chapter`));
    }
    if (object.class === 'Chest') {
      const binding = lootById.get(object.lootRef);
      if (binding === undefined || !availableIn(map, binding.chapter))
        diagnostics.push(diagnostic(map.source.path,
          `${object.id} lootRef ${object.lootRef} is not registered for this map chapter`));
    }
    if (object.class === 'NpcSpawn') for (const chapter of declaredChapters) {
      if (!availableIn(map, chapter)) continue;
      const key = `${chapter}/${map.sceneId}/${object.id}`;
      if (!dialogueByAnchor.has(key)) diagnostics.push(diagnostic(map.source.path,
        `${object.id} dialogue binding is not registered for ${chapter}/${map.sceneId}`));
    }
  }

  for (const entry of registry.entries) {
    if (entry.kind !== 'regionDialogue') continue;
    const binding = entry.value as RegionDialogueBindingDef;
    const map = validMaps.find((candidate) => candidate.sceneId === binding.sceneId &&
      availableIn(candidate, binding.chapter));
    const anchor = map?.objects.find((object) => object.id === binding.anchorId);
    if (map === undefined || anchor === undefined ||
        (anchor.class !== 'NpcSpawn' && anchor.class !== 'Trigger'))
      diagnostics.push(diagnostic(entry.path,
        `${binding.sceneId}/${binding.anchorId} does not name a NpcSpawn or Trigger in ${binding.chapter}`));
  }

  return diagnostics.sort((left, right) =>
    compareCodePoints(left.primary.file, right.primary.file) ||
    compareCodePoints(left.message, right.message));
}

export interface RegionBindingPartition {
  readonly gates: readonly RegionGateBindingDef[];
  readonly dialogues: readonly RegionDialogueBindingDef[];
  readonly loot: readonly RegionLootBindingDef[];
}

/** Selects only bindings referenced by one chapter-region map slice. */
export function regionBindingsForMaps(
  maps: readonly CompiledRegionMap[], registry: ContentRegistry, chapter: string, regionId: string,
): RegionBindingPartition {
  const selected = maps.filter((map) => map.regionId === regionId && availableIn(map, chapter));
  const gates = new Set(selected.flatMap((map) => map.objects.flatMap((object) =>
    object.class === 'Door' && object.lockedBy !== undefined ? [object.lockedBy] : [])));
  const loot = new Set(selected.flatMap((map) => map.objects.flatMap((object) =>
    object.class === 'Chest' ? [object.lootRef] : [])));
  const scenes = new Set(selected.map((map) => map.sceneId));
  return {
    gates: registry.regionGates.filter((row) => row.chapter === chapter && gates.has(row.gateId)),
    dialogues: registry.regionDialogues.filter((row) => row.chapter === chapter &&
      scenes.has(row.sceneId)),
    loot: registry.regionLoot.filter((row) => row.chapter === chapter && loot.has(row.lootRef)),
  };
}
