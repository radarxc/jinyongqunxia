/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Reviewed cross-language fixture.
import { readFileSync } from 'node:fs';
// eslint-disable-next-line no-restricted-imports -- Test-only fixture integrity lock.
import { createHash } from 'node:crypto';
import { canonicalJson, ceilDivInt, mulDivFloor } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { settleOutwardQi } from '../damage';
import { createRng, RNG_PROTOCOL, seedStream } from '../../rng';
import {
  acupointControlProjection, applyMeridianSpeed, attackMeridianBp, defenseMeridianBp,
  grappleControlProjection, meridianStrengthBp, normalizeMeridianProfile, speedMeridianBp,
} from './math';
import { createMeridianFlowRuntime } from './runtime';
import type { MeridianFlowInput, MeridianProfile, QiMoveResolution, RawMeridianProfile } from './types';

interface UnitFixture extends MeridianFlowInput { readonly unitIndex: number;
  readonly kind: 'hero' | 'normal' | 'elite' | 'boss' }
type CommitVector = Omit<QiMoveResolution, 't'>;
interface Fixture { readonly fixtureVersion: number; readonly rulesProtocol: number;
  readonly rngProtocol: number; readonly masterSeed: number; readonly vectorSha256: string;
  readonly inputs: { readonly reference: RawMeridianProfile; readonly ticksBeforeCommit: readonly number[];
    readonly units: readonly UnitFixture[] }; readonly outputs: { readonly commits: Record<string, CommitVector>;
    readonly snapshots: Record<string, unknown>; readonly battleRng: { readonly before: readonly number[];
      readonly afterAllCommits: readonly number[]; readonly segments: readonly { readonly unitId: string;
        readonly before: readonly number[]; readonly after: readonly number[] }[] };
    readonly normalization: { readonly raw: readonly [number, number, number, number];
      readonly standard: readonly [number, number, number, number]; readonly profile: MeridianProfile;
      readonly strengthBp: number }; readonly defense: Record<string, unknown>;
    readonly outwardQi: Record<string, unknown>; readonly speed: Record<string, { readonly profile: MeridianProfile;
      readonly multBp: number }>; readonly control: Record<string, unknown>;
    readonly breath: Record<string, unknown>; readonly ttk: Record<string, unknown> } }

const GOLDEN_URL = new URL('../../../../../tools/balance/meridian_flow_golden_v3.json', import.meta.url);
const EXPECTED_VECTOR_SHA256 = 'be7dcad8f03edc48b8f08b86c40f1a204b94e8ec261bbdea625591f5711a7143';
const fixture = JSON.parse(readFileSync(GOLDEN_URL, 'utf8')) as Fixture;
const STANDARD: MeridianProfile = { qiBp: 10_000, widthBp: 10_000, flowBp: 10_000, completionBp: 10_000 };

function digestFixture(value: Fixture): string {
  const payload: Record<string, unknown> = { ...value };
  delete payload['vectorSha256'];
  return createHash('sha256').update(canonicalJson(payload as never)).digest('hex');
}

function withoutType(result: QiMoveResolution): CommitVector {
  const fields: Record<string, unknown> = { ...result };
  delete fields['t'];
  return fields as unknown as CommitVector;
}

describe('fixtureVersion=3 production MeridianFlowRuntime golden', () => {
  it('locks the reviewed protocol identity and canonical SHA', () => {
    expect([fixture.fixtureVersion, fixture.rulesProtocol, fixture.rngProtocol, fixture.masterSeed])
      .toEqual([3, 3, RNG_PROTOCOL, 20_260_927]);
    expect(fixture.vectorSha256).toBe(EXPECTED_VECTOR_SHA256);
    expect(digestFixture(fixture)).toBe(EXPECTED_VECTOR_SHA256);
  });

  it('matches route trace, quality, CT, four-unit isolation, and three RNG boundaries', () => {
    const rng = createRng(seedStream(fixture.masterSeed, 'battle'));
    const runtimes = fixture.inputs.units.map((input) => {
      const runtime = createMeridianFlowRuntime(input);
      runtime.setIdentity(input.unitIndex, input.kind);
      return runtime;
    });
    expect(rng.snapshot()).toEqual(fixture.outputs.battleRng.before);
    fixture.inputs.units.forEach((input, index) => {
      const runtime = runtimes[index]!;
      runtime.tick(fixture.inputs.ticksBeforeCommit[index]!);
      const expectedSegment = fixture.outputs.battleRng.segments[index]!;
      expect(rng.snapshot()).toEqual(expectedSegment.before);
      const result = runtime.commitMove({ routeId: 'mfr_golden_v3_attack',
        moveId: 'mv_golden_v3', targetIds: ['unit_target'], causeId: `golden:${index}`,
        battleTick: runtime.battleTick, reference: fixture.inputs.reference, defender: STANDARD }, rng);
      expect(withoutType(result)).toEqual(fixture.outputs.commits[input.kind]);
      expect(rng.snapshot()).toEqual(expectedSegment.after);
      expect(runtime.snapshot()).toEqual(fixture.outputs.snapshots[input.kind]);
    });
    expect(rng.snapshot()).toEqual(fixture.outputs.battleRng.afterAllCommits);
    const untouchedPeer = runtimes[1]!.snapshot();
    runtimes[0]!.tick();
    expect(runtimes[1]!.snapshot()).toEqual(untouchedPeer);
  });

  it('matches normalization plus attack, defense, and the 20000-to-5500 anchor', () => {
    const normalized = normalizeMeridianProfile({ releasedQi: fixture.outputs.normalization.raw[0],
      meanFluxCap: fixture.outputs.normalization.raw[1], meanFlowBp: fixture.outputs.normalization.raw[2],
      routeQualityBp: fixture.outputs.normalization.raw[3] }, {
      releasedQi: fixture.outputs.normalization.standard[0],
      meanFluxCap: fixture.outputs.normalization.standard[1],
      meanFlowBp: fixture.outputs.normalization.standard[2],
      routeQualityBp: fixture.outputs.normalization.standard[3],
    });
    expect(normalized).toEqual(fixture.outputs.normalization.profile);
    expect(meridianStrengthBp(normalized)).toBe(fixture.outputs.normalization.strengthBp);
    const defense = fixture.outputs.defense as { defender: MeridianProfile; attacker: MeridianProfile;
      routeLength: number; meridianDefenseBp: number; damageBefore: number; damageAfter: number;
      anchor20000: number };
    expect(defenseMeridianBp(defense.defender, defense.attacker, defense.routeLength))
      .toBe(defense.meridianDefenseBp);
    expect(mulDivFloor(defense.damageBefore, defense.meridianDefenseBp, 10_000))
      .toBe(defense.damageAfter);
    const anchorDefender = { qiBp: 18_000, widthBp: 18_000, flowBp: 18_000, completionBp: 18_000 };
    const anchorAttacker = { qiBp: 8750, widthBp: 8750, flowBp: 8750, completionBp: 10_000 };
    expect(defenseMeridianBp(anchorDefender, anchorAttacker, 18)).toBe(defense.anchor20000);
  });

  it('matches production outward-Qi settlement and its conservation fields', () => {
    const actual = settleOutwardQi({ postShield: 1200, d10: 1600, neutralQiD10: 1000,
      wInBp: 7500, zoneQi: 380, zoneCarryCapacity: 380, defenderStrengthBp: 12_050,
      defenderFlowRatioBp: 12_500, causeId: 'golden:v3', targetId: 'unit_target', segmentIndex: 0 });
    const fields: Record<string, unknown> = { ...actual };
    delete fields['event'];
    expect(fields).toEqual(fixture.outputs.outwardQi);
    expect(actual.cancelled + actual.damageBeforeMpGuard).toBe(1200);
    expect(actual.cancelled).toBeLessThanOrEqual(actual.eligibleIncoming);
  });

  it('matches speed and control projection tables', () => {
    for (const row of Object.values(fixture.outputs.speed)) {
      expect(speedMeridianBp(row.profile, STANDARD)).toBe(row.multBp);
    }
    expect(applyMeridianSpeed(106, 6, fixture.outputs.speed['strongTwoTiers']!.multBp))
      .toEqual({ spd: 129, move: 7, openingQinggongBp: 12_239, evadeRatingDelta: 22 });
    expect(grappleControlProjection(1)).toEqual(fixture.outputs.control['grapple1']);
    expect(grappleControlProjection(9)).toEqual(fixture.outputs.control['grapple9']);
    expect(acupointControlProjection(1)).toEqual(fixture.outputs.control['point1']);
    expect(acupointControlProjection(9)).toEqual(fixture.outputs.control['point9']);
  });

  it('matches all five fixed TTK rows through production attack math', () => {
    const opponents: Record<string, MeridianProfile> = { equal: STANDARD, strongOneTier: STANDARD,
      strongTwoTiers: STANDARD, weakOneTier: STANDARD,
      masterVsMob: { qiBp: 5000, widthBp: 5500, flowBp: 6000, completionBp: 6000 } };
    const attackers: Record<string, MeridianProfile> = { equal: STANDARD,
      strongOneTier: { qiBp: 13_000, widthBp: 12_500, flowBp: 12_500, completionBp: 9500 },
      strongTwoTiers: { qiBp: 17_000, widthBp: 16_000, flowBp: 15_500, completionBp: 10_000 },
      weakOneTier: { qiBp: 8000, widthBp: 8500, flowBp: 8500, completionBp: 8000 },
      masterVsMob: { qiBp: 17_000, widthBp: 16_000, flowBp: 15_500, completionBp: 10_000 } };
    for (const [name, unknownRow] of Object.entries(fixture.outputs.ttk)) {
      const row = unknownRow as { attackMultBp: number; attackerStrengthBp: number;
        defenderStrengthBp: number; baseDamage: number; damage: number; targetHp: number;
        teamEquivBp: number; ttkBeforeActions: number; ttkActions: number };
      const attack = attackMeridianBp(attackers[name]!, opponents[name]!, 10);
      const damage = mulDivFloor(row.baseDamage, attack, 10_000);
      expect({ attackMultBp: attack, attackerStrengthBp: meridianStrengthBp(attackers[name]!),
        defenderStrengthBp: meridianStrengthBp(opponents[name]!), damage,
        ttkBeforeActions: ceilDivInt(row.targetHp * 10_000, row.baseDamage * row.teamEquivBp),
        ttkActions: ceilDivInt(row.targetHp * 10_000, damage * row.teamEquivBp) })
        .toEqual({ attackMultBp: row.attackMultBp, attackerStrengthBp: row.attackerStrengthBp,
          defenderStrengthBp: row.defenderStrengthBp, damage: row.damage,
          ttkBeforeActions: row.ttkBeforeActions, ttkActions: row.ttkActions });
    }
  });

  it('records the reference breath vector as an explicit production gap', () => {
    expect(fixture.outputs.breath).toMatchObject({ supportedByProductionRuntime: false,
      reliefBp: 2500, repairUnits: 617, scope: 3, ct: 1000, mpCostBp: 0 });
    expect('regulateBreath' in createMeridianFlowRuntime(fixture.inputs.units[0]!)).toBe(false);
  });
});
