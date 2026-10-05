import { compareCodePoints } from '@tianshu/shared';
import { z } from 'zod';
import {
  AcupointDefSchema, MeridianPermanentStatSchema, MeridianProgressSchema,
  type AcupointDef, type MeridianProgress,
} from './meridian';
import {
  AcupointIdSchema, MeridianIdSchema, NonNegativeIntegerSchema,
} from './primitives';

const AttemptSchema = z.strictObject({
  progressH: NonNegativeIntegerSchema,
  attemptOrdinal: NonNegativeIntegerSchema,
});

export const MeridianProgressV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  opened: z.array(AcupointIdSchema),
  meridianStats: z.record(MeridianIdSchema, MeridianPermanentStatSchema).optional(),
  acupointStats: z.record(AcupointIdSchema, MeridianPermanentStatSchema).optional(),
  targets: z.record(AcupointIdSchema, AttemptSchema),
  turnCompleted: z.number().int().min(0).max(9),
  turnTarget: z.string().regex(/^zt_[a-z0-9_]+$/).optional(),
  turnState: AttemptSchema.optional(),
  lastAppliedMigration: NonNegativeIntegerSchema,
});

const AcupointDefV1Schema = AcupointDefSchema.omit({
  schemaVersion: true, lengthUnit: true,
}).extend({ schemaVersion: z.literal('acupoint.v1') });

function orderedRecord<T>(value: Readonly<Record<string, T>>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => compareCodePoints(left, right)),
  );
}

function medianGrade(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle]!;
  return Math.floor((sorted[middle - 1]! + sorted[middle]!) / 2);
}

export function migrateAcupointDefV1ToV2(value: unknown): AcupointDef {
  if ((value as { schemaVersion?: unknown } | null)?.schemaVersion === 'acupoint.v2')
    return AcupointDefSchema.parse(value);
  const legacy = AcupointDefV1Schema.parse(value);
  return AcupointDefSchema.parse({ ...legacy, schemaVersion: 'acupoint.v2', lengthUnit: 1 });
}

export function migrateMeridianProgressV1ToV2(
  value: unknown,
  acupoints: readonly Pick<AcupointDef, 'id' | 'gameMeridian'>[],
): MeridianProgress {
  if ((value as { schemaVersion?: unknown } | null)?.schemaVersion === 2)
    return MeridianProgressSchema.parse(value);
  const legacy = MeridianProgressV1Schema.parse(value);
  const byId = new Map<string, string>();
  for (const point of acupoints) {
    if (byId.has(point.id)) throw new TypeError(`MERIDIAN_MIGRATION_DUPLICATE_ACUPOINT:${point.id}`);
    byId.set(point.id, point.gameMeridian);
  }
  const opened = [...new Set(legacy.opened)].sort(compareCodePoints);
  const acupointStats = { ...(legacy.acupointStats ?? {}) };
  for (const id of opened) {
    if (!byId.has(id)) throw new TypeError(`MERIDIAN_MIGRATION_UNKNOWN_ACUPOINT:${id}`);
    acupointStats[id] ??= { grade: 1, strengthLayer: 1, strengthXp: 0, fluxCap: 5 };
  }
  const gradesByMeridian = new Map<string, number[]>();
  for (const id of opened) {
    const meridianId = byId.get(id)!;
    const grades = gradesByMeridian.get(meridianId) ?? [];
    grades.push(acupointStats[id]!.grade);
    gradesByMeridian.set(meridianId, grades);
  }
  const meridianStats = { ...(legacy.meridianStats ?? {}) };
  for (const [id, grades] of [...gradesByMeridian].sort(([left], [right]) => compareCodePoints(left, right))) {
    const grade = medianGrade(grades);
    meridianStats[id] ??= { grade, strengthLayer: 1, strengthXp: 0, fluxCap: 8 + 2 * grade };
  }
  return MeridianProgressSchema.parse({
    schemaVersion: 2, opened, meridianStats: orderedRecord(meridianStats),
    acupointStats: orderedRecord(acupointStats), targets: orderedRecord(legacy.targets),
    turnCompleted: legacy.turnCompleted,
    ...(legacy.turnTarget === undefined ? {} : { turnTarget: legacy.turnTarget }),
    ...(legacy.turnState === undefined ? {} : { turnState: legacy.turnState }),
    lastAppliedMigration: 2,
  });
}
