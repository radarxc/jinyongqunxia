import { z } from 'zod';
import { AcupointIdSchema, MoveIdSchema } from './primitives';

const RadiusSchema = z.number().int().min(0).max(12);
const ZoneInnerSchema = z.discriminatedUnion('tpl', [
  z.strictObject({ tpl: z.enum(['aoe_ring', 'aoe_disk']), r: RadiusSchema }),
  z.strictObject({ tpl: z.literal('aoe_line'), n: z.number().int().min(1).max(6) }),
  z.strictObject({ tpl: z.literal('aoe_cone'), r: RadiusSchema.min(1),
    angle: z.union([z.literal(60), z.literal(120)]), dirCount: z.union([z.literal(6), z.literal(12)]) }),
]);
export const HexShapeSchema = z.discriminatedUnion('tpl', [
  z.strictObject({ tpl: z.literal('aoe_single'), includeEmpty: z.boolean().optional() }),
  z.strictObject({ tpl: z.enum(['aoe_self', 'aoe_around']) }),
  z.strictObject({ tpl: z.enum(['aoe_ring', 'aoe_disk', 'aoe_spokes']), r: RadiusSchema }),
  z.strictObject({ tpl: z.literal('aoe_line'), n: z.number().int().min(1).max(6) }),
  z.strictObject({ tpl: z.enum(['aoe_bolt', 'aoe_allies']), r: RadiusSchema }),
  z.strictObject({ tpl: z.literal('aoe_field'), side: z.enum(['enemy', 'all']) }),
  z.strictObject({ tpl: z.literal('aoe_ally_all') }),
  z.strictObject({ tpl: z.literal('aoe_cone'), r: RadiusSchema.min(1),
    angle: z.union([z.literal(60), z.literal(120)]), dirCount: z.union([z.literal(6), z.literal(12)]) }),
  z.strictObject({ tpl: z.literal('aoe_zone'), inner: ZoneInnerSchema,
    duration: z.number().int().positive() }),
]);

const AcupointTargetSchema = z.union([
  z.strictObject({ mode: z.literal('fixed'), acupointRef: AcupointIdSchema }),
  z.strictObject({ mode: z.literal('targetPrimaryRouteKey') }),
]);

const OnHitSchema = z.strictObject({
  applyBuffs: z.array(z.strictObject({
    buffId: z.string().regex(/^bf_[a-z0-9]+(?:_[a-z0-9]+)*$/),
    chanceBp: z.number().int().min(0).max(10_000),
    turns: z.number().int().positive(),
  })).min(1).optional(),
  displace: z.strictObject({
    kind: z.literal('knockback'), cells: z.number().int().positive(),
  }).optional(),
}).refine((value) => value.applyBuffs !== undefined || value.displace !== undefined,
  'onHit requires applyBuffs or displace');

export const MoveDefSchema = z.strictObject({
  schemaVersion: z.literal('move.v1'), id: MoveIdSchema, name: z.string().min(1),
  skillId: z.string().regex(/^sk_[a-z0-9_]+$/), unlock: z.number().int().min(1).max(10),
  kind: z.enum(['attack', 'support', 'stance', 'utility']),
  ultimate: z.boolean(), rageCost: z.literal(100).optional(),
  target: z.enum(['enemy', 'ally', 'self', 'tile', 'any']),
  range: z.strictObject({ min: RadiusSchema, max: RadiusSchema }),
  shape: HexShapeSchema, delivery: z.enum(['melee', 'ranged', 'projectile', 'sonic', 'self']),
  hTol: z.number().int().min(0).max(99),
  powerBp: z.number().int().min(0), referencePowerBp: z.number().int().positive(),
  wInBp: z.number().int().min(0).max(10_000),
  mpCost: z.number().int().min(0), recovery: z.number().int().min(700).max(1500),
  hitZone: z.enum(['body', 'hand', 'leg']), hitMod: z.number().int().optional(),
  dmgUpBp: z.number().int().optional(), pierceOutBp: z.number().int().optional(),
  pierceInBp: z.number().int().optional(), projection: z.boolean().optional(),
  penetratingQi: z.boolean().optional(), acupointStrike: z.strictObject({
    level: z.number().int().min(1).max(9), occupyingQiBp: z.number().int().min(1).max(10_000).optional(),
  }).optional(),
  targetAcupoint: AcupointTargetSchema.optional(),
  affectedRouteRefs: z.array(z.string().regex(/^mfr_[a-z0-9_]+$/)).optional(),
  meridianRouteRef: z.string().regex(/^mfr_[a-z0-9_]+$/).optional(),
  autoTargetCap: z.number().int().min(1).max(4).optional(),
  direction: z.enum(['front', 'side', 'back']).optional(),
  onHit: OnHitSchema.optional(), parryable: z.boolean().optional(),
  friendlyFire: z.enum(['none', 'allies', 'all']),
}).superRefine((value, context) => {
  if (value.range.min > value.range.max)
    context.addIssue({ code: 'custom', path: ['range'], message: 'range min must not exceed max' });
  if (value.ultimate !== (value.rageCost === 100))
    context.addIssue({ code: 'custom', path: ['rageCost'], message: 'ultimate moves require rageCost 100 only' });
  if (value.penetratingQi && !value.projection)
    context.addIssue({ code: 'custom', path: ['penetratingQi'], message: 'penetratingQi requires projection' });
});

export type MoveDef = z.output<typeof MoveDefSchema>;

export interface CompiledBattleMove {
  readonly id: `mv_${string}`; readonly powerBp: number; readonly referencePowerBp: number;
  readonly skillId: `sk_${string}`; readonly sourceGrade?: number;
  readonly wInBp: number; readonly recovery: number; readonly mpCost: number;
  readonly hitZone: 'body' | 'hand' | 'leg'; readonly range: { readonly min: number; readonly max: number };
  readonly delivery: 'melee' | 'ranged' | 'projectile' | 'sonic' | 'self';
  readonly shape: z.output<typeof HexShapeSchema>; readonly hTol: number;
  readonly target: 'enemy' | 'ally' | 'self' | 'tile' | 'any';
  readonly friendlyFire?: 'none' | 'allies' | 'all';
  readonly hitMod?: number; readonly dmgUpBp?: number; readonly pierceOutBp?: number;
  readonly pierceInBp?: number; readonly ultimate?: boolean; readonly projection?: boolean;
  readonly penetratingQi?: boolean; readonly acupointStrike?: boolean;
  readonly sealLevel?: number; readonly targetAcupoint?: string;
  readonly affectedRouteRefs?: readonly string[]; readonly autoTargetCap?: number;
  readonly direction?: 'front' | 'side' | 'back';
  readonly onHit?: { readonly applyBuffs?: readonly { readonly buffId: `bf_${string}`;
    readonly chanceBp: number; readonly turns: number }[];
    readonly displace?: { readonly kind: 'knockback'; readonly cells: number } };
  readonly parryable?: boolean;
}

export interface BattleMoveCompileSource {
  readonly skillId: `sk_${string}`;
  /** Effective, post-suppression grade resolved for this battle participant. */
  readonly effGrade: number;
}

export function compileBattleMove(move: MoveDef, source?: BattleMoveCompileSource): CompiledBattleMove {
  if (source !== undefined && (source.skillId !== move.skillId
    || !Number.isSafeInteger(source.effGrade) || source.effGrade < 1 || source.effGrade > 12)) {
    throw new TypeError('BATTLE_MOVE_SOURCE');
  }
  if (move.onHit?.applyBuffs !== undefined && source === undefined) {
    throw new TypeError('BATTLE_MOVE_SOURCE_GRADE_REQUIRED');
  }
  const targetAcupoint = move.targetAcupoint?.mode === 'fixed'
    ? move.targetAcupoint.acupointRef : undefined;
  const onHit = move.onHit === undefined ? undefined : {
    ...(move.onHit.applyBuffs === undefined ? {} : { applyBuffs: move.onHit.applyBuffs.map(
      (application) => ({ ...application, buffId: application.buffId as `bf_${string}` })),
    }),
    ...(move.onHit.displace === undefined ? {} : { displace: move.onHit.displace }),
  };
  return {
    id: move.id as `mv_${string}`, skillId: move.skillId as `sk_${string}`,
    powerBp: move.powerBp,
    referencePowerBp: move.referencePowerBp,
    wInBp: move.wInBp, recovery: move.recovery, mpCost: move.mpCost,
    hitZone: move.hitZone, range: move.range, delivery: move.delivery, shape: move.shape,
    hTol: move.hTol, target: move.target, friendlyFire: move.friendlyFire,
    ...(move.hitMod === undefined ? {} : { hitMod: move.hitMod }),
    ...(move.dmgUpBp === undefined ? {} : { dmgUpBp: move.dmgUpBp }),
    ...(move.pierceOutBp === undefined ? {} : { pierceOutBp: move.pierceOutBp }),
    ...(move.pierceInBp === undefined ? {} : { pierceInBp: move.pierceInBp }),
    ...(move.ultimate ? { ultimate: true } : {}),
    ...(move.projection === undefined ? {} : { projection: move.projection }),
    ...(move.penetratingQi === undefined ? {} : { penetratingQi: move.penetratingQi }),
    ...(move.acupointStrike === undefined ? {} : {
      acupointStrike: true, sealLevel: move.acupointStrike.level,
    }),
    ...(targetAcupoint === undefined ? {} : { targetAcupoint }),
    ...(move.affectedRouteRefs === undefined ? {} : { affectedRouteRefs: move.affectedRouteRefs }),
    ...(move.autoTargetCap === undefined ? {} : { autoTargetCap: move.autoTargetCap }),
    ...(move.direction === undefined ? {} : { direction: move.direction }),
    ...(source === undefined ? {} : { sourceGrade: source.effGrade }),
    ...(onHit === undefined ? {} : { onHit }),
    ...(move.parryable === undefined ? {} : { parryable: move.parryable }),
  };
}
