import { z } from 'zod';
import {
  ChapterIdSchema, CharacterTemplateIdSchema, EncounterIdSchema, FlagIdSchema, NpcIdSchema,
  PositiveIntegerSchema, QuestIdSchema,
} from './primitives';
import { HexDirectionSchema, RegionIdSchema, RegionSceneIdSchema } from './region-map';

const UnitRefSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
const LocalRefSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
const SideSchema = z.enum(['player', 'ally', 'enemy', 'neutral']);
const PositionSchema = z.strictObject({
  q: z.number().int().safe(), r: z.number().int().safe(),
});
const CoverSchema = z.strictObject({
  vs: z.array(z.enum(['projectile', 'ranged'])).min(1),
  hit: z.number().int().safe(), hitByDelivery: z.strictObject({
    projectile: z.number().int().safe().optional(), ranged: z.number().int().safe().optional(),
  }).optional(), damageBp: z.number().int().safe(),
  sourceDirs: z.array(HexDirectionSchema).min(1).optional(),
});
export const EncounterGridCellSchema = z.strictObject({
  ...PositionSchema.shape, height: z.number().int().min(0).max(10),
  moveCost: z.number().int().min(1), canopy: z.number().int().min(0).default(0),
  los: z.enum(['none', 'partial', 'full']).default('none'),
  standable: z.boolean().default(true), narrow: z.boolean().default(false),
  dangerous: z.boolean().default(false), terrainDealtBp: z.number().int().default(0),
  terrainTakenBp: z.number().int().default(0), cover: CoverSchema.nullable().default(null),
});

const RegionArenaSchema = z.strictObject({
  kind: z.literal('regionArena'), regionId: RegionIdSchema, sceneId: RegionSceneIdSchema,
  arenaId: LocalRefSchema,
});
const InlineArenaSchema = z.strictObject({
  kind: z.literal('inline'), topology: z.literal('hex-pointy'), anchorId: LocalRefSchema,
  cells: z.array(EncounterGridCellSchema).min(2).max(400),
});
export const EncounterArenaSchema = z.discriminatedUnion('kind', [
  RegionArenaSchema, InlineArenaSchema,
]);

const PlacementSchema = z.strictObject({ pos: PositionSchema, facing: HexDirectionSchema });
const NpcSourceSchema = z.strictObject({ kind: z.literal('npc'), npcId: NpcIdSchema });
const CharacterSourceSchema = z.strictObject({
  kind: z.literal('character'), characterRef: z.string().regex(/^(?:protagonist|companion:[a-z0-9_:-]+)$/),
});
const TemplateSourceSchema = z.strictObject({
  kind: z.literal('template'), templateId: CharacterTemplateIdSchema,
  dreamLevel: z.number().int().min(1).max(20),
});
export const EncounterParticipantSchema = z.strictObject({
  unitRef: UnitRefSchema, source: z.discriminatedUnion('kind', [
    NpcSourceSchema, CharacterSourceSchema, TemplateSourceSchema,
  ]),
  side: SideSchema, control: z.enum(['player', 'ai']), spawnId: LocalRefSchema,
  state: z.enum(['active', 'hidden', 'offgrid', 'held']).default('active'),
  required: z.boolean().default(true), group: LocalRefSchema.optional(),
  placement: PlacementSchema,
});

export const EncounterConditionSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('allHostileDown'), side: SideSchema }),
  z.strictObject({ kind: z.literal('unitDown'), unitRef: UnitRefSchema }),
  z.strictObject({ kind: z.literal('surviveRounds'), rounds: PositiveIntegerSchema }),
  z.strictObject({ kind: z.literal('actionLimit'), actions: PositiveIntegerSchema }),
  z.strictObject({ kind: z.literal('hitCount'), actorSide: SideSchema,
    targetSide: SideSchema, hits: PositiveIntegerSchema }),
]);
const OutcomeSchema = z.strictObject({
  win: z.array(EncounterConditionSchema).min(1),
  lose: z.array(EncounterConditionSchema).min(1), draw: z.array(EncounterConditionSchema),
  onDefeat: z.union([z.literal('retry'), z.literal('continue'),
    z.string().regex(/^branch:[a-z][a-z0-9_]*$/)]),
  concede: z.enum(['forbidden', 'lose', 'advance']),
});
const RuleSchema = z.strictObject({
  mode: z.enum(['normal', 'spar', 'deathmatch', 'guard']),
  noAuto: z.boolean(), noRetreat: z.boolean(), noItems: z.boolean(),
  mercyAllowed: z.boolean(), lethalIntent: z.boolean(), friendlyFire: z.boolean(),
  roundLimit: z.number().int().min(1).max(60), boss: z.boolean(), retry: z.boolean(),
  skippable: z.boolean(),
});
export const EncounterSettlementActionSchema = z.discriminatedUnion('op', [
  z.strictObject({ op: z.literal('flag/set'), flagId: FlagIdSchema, value: z.boolean() }),
  z.strictObject({ op: z.literal('quest/advance'), quest: QuestIdSchema,
    stage: z.string().regex(/^st_[a-z0-9_]+$/) }),
  z.strictObject({ op: z.literal('dialogue/start'),
    storyId: z.string().regex(/^(?:story|ink)_[a-z0-9_]+$/),
    knot: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.]*$/) }),
]);
const SettlementSchema = z.strictObject({
  onWin: z.array(EncounterSettlementActionSchema),
  onLose: z.array(EncounterSettlementActionSchema),
  onConcede: z.array(EncounterSettlementActionSchema),
  onAssisted: z.array(EncounterSettlementActionSchema),
  lossFlags: z.array(FlagIdSchema).max(9), resetLossOnWin: z.boolean(),
});

export const EncounterBeatSchema = z.strictObject({
  id: LocalRefSchema, once: z.boolean().default(true),
  when: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('hpBelow'), unitRef: UnitRefSchema,
      thresholdBp: z.number().int().min(1).max(9_999) }),
    z.strictObject({ kind: z.literal('lossStreak'), count: PositiveIntegerSchema }),
  ]),
  actions: z.array(z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('emit'), event: z.string().regex(/^battle\/[a-z][A-Za-z0-9]*$/) }),
    z.strictObject({ kind: z.literal('switchControl'), unitRef: UnitRefSchema,
      control: z.enum(['player', 'ai']) }),
    z.strictObject({ kind: z.literal('offerDemonstration'), replayId: LocalRefSchema }),
  ])).min(1),
});
const DifficultySchema = z.strictObject({
  localDifficulty: z.number().int().min(1).max(10),
  enemyStatBp: z.number().int().min(9_000).max(13_500),
  modes: z.strictObject({
    diff_jianghu: z.strictObject({ hpBp: z.literal(8_000), attackBp: z.literal(8_000) }),
    diff_xiake: z.strictObject({ hpBp: z.literal(10_000), attackBp: z.literal(10_000) }),
    diff_zongshi: z.strictObject({ hpBp: z.literal(12_000), attackBp: z.literal(11_200) }),
  }),
}).superRefine((value, context) => {
  if (value.enemyStatBp !== 8_500 + 500 * value.localDifficulty) context.addIssue({
    code: 'custom', path: ['enemyStatBp'], message: 'enemyStatBp must equal 8500 + 500D',
  });
});

export const EncounterDefSchema = z.strictObject({
  schemaVersion: z.literal('encounter.v1'), id: EncounterIdSchema, chapterId: ChapterIdSchema,
  kind: z.enum(['field', 'ambush', 'ambushed', 'story', 'spar', 'arena', 'mass']),
  arena: EncounterArenaSchema, participants: z.array(EncounterParticipantSchema).min(2),
  outcome: OutcomeSchema, rules: RuleSchema, beats: z.array(EncounterBeatSchema),
  difficulty: DifficultySchema, settlement: SettlementSchema.optional(),
}).superRefine((value, context) => {
  const unitRefs = value.participants.map((row) => row.unitRef);
  if (new Set(unitRefs).size !== unitRefs.length) context.addIssue({
    code: 'custom', path: ['participants'], message: 'unitRef values must be unique',
  });
  const placements = value.participants.filter((row) => row.state !== 'offgrid')
    .map((row) => `${row.placement.pos.q},${row.placement.pos.r}`);
  if (new Set(placements).size !== placements.length) context.addIssue({
    code: 'custom', path: ['participants'], message: 'active placements must be unique',
  });
  const conditionRefs = [...value.outcome.win, ...value.outcome.lose, ...value.outcome.draw]
    .flatMap((row) => row.kind === 'unitDown' ? [row.unitRef] : []);
  const actionRefs = value.beats.flatMap((beat) => [
    ...(beat.when.kind === 'hpBelow' ? [beat.when.unitRef] : []),
    ...beat.actions.flatMap((action) => action.kind === 'switchControl' ? [action.unitRef] : []),
  ]);
  for (const ref of [...conditionRefs, ...actionRefs]) if (!unitRefs.includes(ref)) context.addIssue({
    code: 'custom', path: ['participants'], message: `unknown unitRef ${ref}`,
  });
  if (value.rules.mode === 'spar' && (value.rules.lethalIntent || !value.rules.mercyAllowed))
    context.addIssue({ code: 'custom', path: ['rules'],
      message: 'spar requires mercyAllowed and forbids lethalIntent' });
  if (value.rules.retry !== (value.outcome.onDefeat === 'retry')) context.addIssue({
    code: 'custom', path: ['rules', 'retry'], message: 'retry must match onDefeat',
  });
  if (value.outcome.concede === 'advance' && value.rules.mode !== 'spar') context.addIssue({
    code: 'custom', path: ['outcome', 'concede'], message: 'advance concede is spar-only',
  });
  if (value.arena.kind === 'inline') {
    const cells = value.arena.cells; const keys = cells.map((cell) => `${cell.q},${cell.r}`);
    const qs = cells.map((cell) => cell.q); const rs = cells.map((cell) => cell.r);
    if (new Set(keys).size !== keys.length || Math.max(...qs) - Math.min(...qs) + 1 > 20
      || Math.max(...rs) - Math.min(...rs) + 1 > 20) context.addIssue({
      code: 'custom', path: ['arena', 'cells'], message: 'inline grid must be unique within 20 spans',
    });
    const standable = new Set(cells.filter((cell) => cell.standable)
      .map((cell) => `${cell.q},${cell.r}`));
    for (const row of value.participants) if (row.state !== 'offgrid' &&
      !standable.has(`${row.placement.pos.q},${row.placement.pos.r}`)) context.addIssue({
      code: 'custom', path: ['participants'], message: `${row.unitRef} is outside standable grid`,
    });
  }
});

export type EncounterDef = z.output<typeof EncounterDefSchema>;
export type EncounterParticipant = z.output<typeof EncounterParticipantSchema>;
export type EncounterCondition = z.output<typeof EncounterConditionSchema>;
export type EncounterBeat = z.output<typeof EncounterBeatSchema>;
export type EncounterSettlementAction = z.output<typeof EncounterSettlementActionSchema>;
