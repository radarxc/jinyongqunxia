import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseContentFile } from '@tianshu/data/tooling';
import { describe, expect, it } from 'vitest';
import type { TownFacilitiesDef, TownRuntimeDefinition } from '@tianshu/data/schemas';
import { createV1ContextActions } from '../explore/v1-context-actions';
import { createPreviewSession } from './bootstrap';
import { createExploreProjection } from './explore-projection';
import { createSessionSelectors } from './session-projection';
import { fixtureContent } from './test-fixture';

function authored<T>(path: string): T {
  const text = readFileSync(resolve(process.cwd(), path), 'utf8');
  return parseContentFile({ path, text }).value as T;
}

describe('explore facility projection', () => {
  it.each([
    ['the ch01 definition', (town: TownRuntimeDefinition) => town],
    // The dev build's borrowed town keeps source.spec but takes the ch10 identity.
    [
      'a definition re-identified as ch10',
      (town: TownRuntimeDefinition): TownRuntimeDefinition => ({ ...town, chapterId: 'ch10' }),
    ],
  ] as const)(
    'projects a talkable ch01 pharmacy while ch10 borrows Dali via %s',
    (_name, select) => {
      const facilities = authored<TownFacilitiesDef>(
        'content/town/facilities/city_dali__ch01.yaml',
      );
      const town = authored<TownRuntimeDefinition>('content/town/ch01/city_dali.json');
      const pharmacy = facilities.facilities.find((entry) => entry.sub === 'yaopu');
      if (pharmacy === undefined) throw new Error('FIXTURE_PHARMACY_MISSING');
      const building = town.buildings.find((entry) => entry.id === pharmacy.buildingId);
      const entrance = building?.entrances[0];
      if (entrance === undefined) throw new Error('FIXTURE_PHARMACY_ENTRANCE_MISSING');
      const content = Object.assign(fixtureContent(), { townFacilities: [facilities] });
      Reflect.deleteProperty(content, 'towns');
      expect('towns' in content).toBe(false);
      const opening = createPreviewSession(content, 'ch10_baima');
      const session = {
        ...opening,
        chapter: {
          ...opening.chapter,
          town: {
            version: 1 as const,
            townRevision: town.revision,
            sceneId: town.sceneId,
            point: entrance,
            buildingId: pharmacy.buildingId,
            buildingPhase: 'inside' as const,
          },
        },
      };
      const projection = createExploreProjection(
        createSessionSelectors(content, () => select(town)),
        content,
      );

      const changes = projection.update(session, ['town']);
      expect(changes.town?.facility).toEqual({
        key: pharmacy.key,
        kind: pharmacy.kind,
        nameKey: pharmacy.nameKey,
        shopKey: `${facilities.layoutKey}/${pharmacy.key}`,
      });
      expect(changes.town?.facility?.shopKey).toBe('city_dali__ch01/yaopu_01');
      const facility = changes.town?.facility;
      expect(facility).toBeDefined();
      expect(
        createV1ContextActions({
          actor: changes.town!.scene.actor.point,
          anchors: changes.town!.scene.anchors,
          facility: facility!,
          facilityName: '苍山药肆',
          inside: true,
          canLeave: changes.town!.canLeave,
          busy: false,
        }),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ verb: '交谈', label: '与苍山药肆店员交谈' }),
        ]),
      );
    },
  );
});
