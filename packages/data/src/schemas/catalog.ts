import { z } from 'zod';
import { AcupointIdSchema, EventIdSchema, MeridianIdSchema, SectIdSchema } from './primitives';

const MeridianTopologyEntrySchema = z.strictObject({
  id: MeridianIdSchema,
  name: z.string().min(1),
  points: z.array(z.strictObject({
    id: AcupointIdSchema,
    name: z.string().min(1),
  })).min(1),
});

export const MeridianTopologyCatalogSchema = z.strictObject({
  schemaVersion: z.literal('meridian-topology.v1'),
  id: EventIdSchema,
  event: z.literal('content/meridianTopologyCatalog'),
  group: z.enum(['regular12', 'extra8']),
  meridians: z.array(MeridianTopologyEntrySchema).min(1),
}).superRefine((value, context) => {
  const expectedCount = value.group === 'regular12' ? 12 : 8;
  if (value.meridians.length !== expectedCount)
    context.addIssue({ code: 'custom', path: ['meridians'],
      message: `${value.group} must contain ${expectedCount} meridians` });
  if (value.id !== `ev_common_meridians_${value.group}`)
    context.addIssue({ code: 'custom', path: ['id'], message: 'catalog ID must match group' });
  if (new Set(value.meridians.map((entry) => entry.id)).size !== value.meridians.length)
    context.addIssue({ code: 'custom', path: ['meridians'], message: 'meridian IDs must be unique' });
  const points = value.meridians.flatMap((entry) => entry.points.map((point) => point.id));
  if (new Set(points).size !== points.length)
    context.addIssue({ code: 'custom', path: ['meridians'], message: 'acupoint IDs must be unique' });
});

export const SectCatalogSchema = z.strictObject({
  schemaVersion: z.literal('sect-catalog.v1'),
  id: EventIdSchema,
  event: z.literal('content/sectCatalog'),
  group: z.enum(['temples', 'estates', 'associations', 'gulong']),
  sects: z.array(z.strictObject({ id: SectIdSchema, name: z.string().min(1) })).min(1),
}).superRefine((value, context) => {
  const counts = { temples: 29, estates: 22, associations: 33, gulong: 15 } as const;
  const expectedCount = counts[value.group];
  if (value.sects.length !== expectedCount)
    context.addIssue({ code: 'custom', path: ['sects'],
      message: `${value.group} must contain ${expectedCount} sects` });
  if (value.id !== `ev_common_sects_${value.group}`)
    context.addIssue({ code: 'custom', path: ['id'], message: 'catalog ID must match group' });
  if (new Set(value.sects.map((entry) => entry.id)).size !== value.sects.length)
    context.addIssue({ code: 'custom', path: ['sects'], message: 'sect IDs must be unique' });
});

export type MeridianTopologyCatalog = z.output<typeof MeridianTopologyCatalogSchema>;
export type SectCatalog = z.output<typeof SectCatalogSchema>;
