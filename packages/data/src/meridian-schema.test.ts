import { describe, expect, it } from 'vitest';
import {
  MeridianDefSchema, MeridianProgressSchema, migrateAcupointDefV1ToV2,
  migrateMeridianProgressV1ToV2,
} from './schemas';

function meridian(acupoints: readonly string[]): Record<string, unknown> {
  return {
    schemaVersion: 'meridian.v1', id: 'mer_fixture', name: '测试经脉',
    family: 'extra8', nature: 'harmony', difficultyTier: 1,
    direction: '测试方向', organRelation: '测试脏腑', acupoints,
    unlock: { minMainInnerLayer: 1 }, completionRewards: [],
  };
}

describe('MeridianDefSchema', () => {
  it('accepts six to twelve unique acupoints', () => {
    const ids = Array.from({ length: 6 }, (_, index) => `ap_fixture_${index + 1}`);
    expect(MeridianDefSchema.safeParse(meridian(ids)).success).toBe(true);
    expect(MeridianDefSchema.safeParse(meridian([...ids, ...ids])).success).toBe(false);
  });

  it('rejects fewer than six or more than twelve acupoints', () => {
    expect(MeridianDefSchema.safeParse(meridian(['ap_fixture_1'])).success).toBe(false);
    const ids = Array.from({ length: 13 }, (_, index) => `ap_fixture_${index + 1}`);
    expect(MeridianDefSchema.safeParse(meridian(ids)).success).toBe(false);
  });
});

describe('meridian v1 to v2 migrations', () => {
  const points = [
    { id: 'ap_fixture_a', gameMeridian: 'mer_fixture' },
    { id: 'ap_fixture_b', gameMeridian: 'mer_fixture' },
  ];

  it('fills progress defaults in stable order and is idempotent', () => {
    const migrated = migrateMeridianProgressV1ToV2({
      schemaVersion: 1, opened: ['ap_fixture_b', 'ap_fixture_a'],
      targets: {}, turnCompleted: 0, lastAppliedMigration: 1,
    }, points);
    expect(migrated).toEqual({
      schemaVersion: 2, opened: ['ap_fixture_a', 'ap_fixture_b'],
      meridianStats: { mer_fixture: { grade: 1, strengthLayer: 1, strengthXp: 0, fluxCap: 10 } },
      acupointStats: {
        ap_fixture_a: { grade: 1, strengthLayer: 1, strengthXp: 0, fluxCap: 5 },
        ap_fixture_b: { grade: 1, strengthLayer: 1, strengthXp: 0, fluxCap: 5 },
      },
      targets: {}, turnCompleted: 0, lastAppliedMigration: 2,
    });
    expect(migrateMeridianProgressV1ToV2(migrated, points)).toEqual(migrated);
    expect(MeridianProgressSchema.parse(migrated)).toEqual(migrated);
  });

  it('preserves legal permanent fields and rejects invalid legacy values', () => {
    const legacy = {
      schemaVersion: 1, opened: ['ap_fixture_a'], targets: {}, turnCompleted: 0,
      lastAppliedMigration: 1,
      acupointStats: { ap_fixture_a: { grade: 7, strengthLayer: 3, strengthXp: 8, fluxCap: 18 } },
      meridianStats: { mer_fixture: { grade: 6, strengthLayer: 2, strengthXp: 9, fluxCap: 24 } },
    };
    expect(migrateMeridianProgressV1ToV2(legacy, points).acupointStats['ap_fixture_a'])
      .toEqual(legacy.acupointStats.ap_fixture_a);
    expect(() => migrateMeridianProgressV1ToV2({
      ...legacy, acupointStats: { ap_fixture_a: { ...legacy.acupointStats.ap_fixture_a, fluxCap: 65 } },
    }, points)).toThrow();
  });

  it('adds the documented default length to acupoint v1 exactly once', () => {
    const legacy = {
      schemaVersion: 'acupoint.v1', id: 'ap_fixture_a', name: '测试穴',
      gameMeridian: 'mer_fixture', standardCode: 'T1', standardMeridian: 'mer_fixture',
      routeKind: 'native', sequence: 1, barrierH: 260, baseRewards: [],
      passiveBuffs: [], sourceRef: 'design/15 §11.2',
    };
    const migrated = migrateAcupointDefV1ToV2(legacy);
    expect(migrated.lengthUnit).toBe(1);
    expect(migrateAcupointDefV1ToV2(migrated)).toEqual(migrated);
  });
});
