import {
  BP_SCALE, ceilDivInt, clampInt, compareCodePoints, floorDivInt, mulDivFloor,
} from '@tianshu/shared';
import { createRng, seedStream, type Rng } from '../../rng';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Purpose = 'attack' | 'defense' | 'movement';

interface GoldenRoute {
  readonly id: string;
  readonly nodes: readonly string[];
  readonly purpose: Purpose;
  readonly riskBp: readonly number[];
  readonly segmentCt: readonly number[];
}

interface Cultivation {
  readonly grade: number;
  readonly layer: number;
  readonly mpRatioBp: number;
  readonly innerNature: string;
  readonly meridianNature: string;
  readonly meridianComplete: boolean;
  readonly smallCycle: boolean;
  readonly greatCycle: boolean;
  readonly twelveCycle: boolean;
  readonly turns: number;
  readonly practiceBp: number;
}

interface GoldenUnit {
  readonly unitId: string;
  readonly kind: string;
  readonly unitIndex: number;
  readonly capacityScaleBp: number;
  readonly cultivation: Cultivation;
  readonly openedAcupoints: readonly string[];
  readonly completeAcupoints: readonly string[];
}

/** Frozen fixtureVersion=2 input. Never use this model as production evidence. */
export interface LegacyProtocol2Inputs {
  readonly explicitRolls: { readonly clean: number; readonly forcedJam: number };
  readonly routes: readonly GoldenRoute[];
  readonly units: Readonly<Record<string, GoldenUnit>>;
}

interface Profile extends Record<string, number> {
  readonly qiBp: number;
  readonly capacityBp: number;
  readonly flowBp: number;
  readonly completionBp: number;
}

interface NodeState extends Record<string, Json> {
  readonly acupointRef: string;
  opened: boolean;
  water: number;
  capacity: number;
  flowBp: number;
  stagnationBp: number;
  backlog: number;
  ruptureDamage: number;
  sealLevel: number;
  sealSource: string | null;
  sealRemaining: number;
}

interface FlowResult {
  readonly unitId: string;
  readonly routeId: string;
  completed: number;
  attempted: number;
  routeQualityBp: number;
  flowCt: number;
  blockedAt: number | null;
  blockedNode: string | null;
  readonly states: NodeState[];
  readonly qualitiesBp: number[];
  readonly jamChancesBp: number[];
  readonly arrivalBp: number[];
  readonly trace: Json[];
  stateVersion: number;
  disabledReason: string | null;
}

const G_BP = [0, 10_000, 11_000, 12_000, 14_000, 15_500, 17_000,
  20_000, 22_000, 24_000, 28_000, 31_000, 35_000] as const;
const POINT_PENALTY = [0, 500, 1000, 1600, 2300, 3200, 4300, 5700, 7500, 10000] as const;
const ATTACK_CURVE = [[4000, 6500], [5000, 6500], [6500, 7200], [8000, 8600],
  [10000, 10000], [12000, 13000], [15000, 16500], [18000, 19000],
  [22000, 22000], [25000, 22000]] as const;
const DEFENSE_CURVE = [[4000, 13000], [5000, 12500], [8000, 11000],
  [10000, 10000], [12000, 8800], [15000, 7000], [20000, 5500],
  [22000, 5000], [25000, 5000]] as const;
const SPEED_CURVE = [[4000, 7500], [6000, 8000], [8000, 9000], [10000, 10000],
  [12000, 11000], [15000, 12250], [18000, 13500]] as const;

const STANDARD: Profile = { qiBp: 10_000, capacityBp: 10_000, flowBp: 10_000, completionBp: 10_000 };
const STRONG: Profile = { qiBp: 13_000, capacityBp: 12_500, flowBp: 12_500, completionBp: 9500 };
const VERY_STRONG: Profile = { qiBp: 17_000, capacityBp: 16_000, flowBp: 15_500, completionBp: 10_000 };
const WEAK: Profile = { qiBp: 8000, capacityBp: 8500, flowBp: 8500, completionBp: 8000 };
const MOB: Profile = { qiBp: 5000, capacityBp: 5500, flowBp: 6000, completionBp: 6000 };

function integerSqrt(value: number): number {
  let low = 0;
  let high = Math.min(value, 1 << 24);
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const square = middle * middle;
    if (square <= value) low = middle + 1;
    else high = middle - 1;
  }
  return high;
}

function interpolate(value: number, anchors: readonly (readonly [number, number])[]): number {
  if (value <= anchors[0]![0]) return anchors[0]![1];
  for (let index = 1; index < anchors.length; index += 1) {
    const right = anchors[index]!;
    const left = anchors[index - 1]!;
    if (value <= right[0]) {
      const delta = right[1] - left[1];
      const interpolated = mulDivFloor(
        value - left[0], Math.abs(delta), right[0] - left[0],
      );
      return left[1] + (delta < 0 ? -interpolated : interpolated);
    }
  }
  return anchors[anchors.length - 1]![1];
}

function affinityBp(inner: string, meridian: string): number {
  if (inner === 'harmony') return meridian === 'harmony' ? 11_000 : 10_500;
  if (meridian === 'harmony') return BP_SCALE;
  return inner === meridian ? 11_000 : 8800;
}

function deriveNode(
  acupointRef: string, cultivation: Cultivation, capacityScaleBp: number,
  opened: boolean, complete: boolean,
): NodeState {
  const gradeBp = G_BP[cultivation.grade]!;
  const depthBp = integerSqrt(clampInt(cultivation.mpRatioBp, 5000, 20_000) * BP_SCALE);
  let capacity = 700 + floorDivInt(gradeBp, 50) + 25 * cultivation.layer;
  capacity += complete ? 100 : 0;
  capacity += cultivation.smallCycle ? 50 : 0;
  capacity += cultivation.greatCycle ? 100 : 0;
  capacity += cultivation.twelveCycle ? 100 : 0;
  capacity += 20 * clampInt(cultivation.turns, 0, 9);
  capacity = mulDivFloor(mulDivFloor(capacity, depthBp, BP_SCALE), capacityScaleBp, BP_SCALE);
  let flowBp = 4500 + floorDivInt(gradeBp, 10) + 250 * cultivation.layer;
  flowBp += complete ? 400 : 0;
  flowBp += cultivation.smallCycle ? 200 : 0;
  flowBp += cultivation.greatCycle ? 400 : 0;
  flowBp += cultivation.twelveCycle ? 400 : 0;
  flowBp += 100 * clampInt(cultivation.turns, 0, 9);
  flowBp = clampInt(mulDivFloor(
    flowBp, affinityBp(cultivation.innerNature, cultivation.meridianNature), BP_SCALE,
  ), 3000, BP_SCALE);
  return { acupointRef, opened, water: 0, capacity: clampInt(capacity, 600, 2600),
    flowBp, stagnationBp: 0, backlog: 0, ruptureDamage: 0, sealLevel: 0,
    sealSource: null, sealRemaining: 0 };
}

function cloneNode(node: NodeState): NodeState {
  return { ...node };
}

function jamChanceBp(
  incoming: number, node: NodeState, practiceBp: number, riskBp: number,
): number {
  const loadBp = ceilDivInt(incoming * BP_SCALE, Math.max(1, node.capacity));
  const overloadBp = floorDivInt(Math.max(0, loadBp - 9000), 4);
  return clampInt(riskBp + floorDivInt(BP_SCALE - clampInt(practiceBp, 0, BP_SCALE), 8)
    + floorDivInt(node.stagnationBp, 4) + overloadBp + node.sealLevel * 350, 0, 8500);
}

class GoldenUnitRuntime {
  readonly nodes = new Map<string, NodeState>();
  private version = 0;

  constructor(readonly input: GoldenUnit, allAcupoints: readonly string[]) {
    const opened = new Set(input.openedAcupoints);
    const complete = new Set(input.completeAcupoints);
    for (const acupoint of [...allAcupoints].sort(compareCodePoints)) {
      this.nodes.set(acupoint, deriveNode(
        acupoint, input.cultivation, input.capacityScaleBp,
        opened.has(acupoint), complete.has(acupoint),
      ));
    }
  }

  preview(route: GoldenRoute, roll = 9999): FlowResult {
    return this.run(route, () => roll);
  }

  commit(route: GoldenRoute, rng: Rng): FlowResult {
    return this.commitResult(this.run(route, () => rng.nextU32() % BP_SCALE));
  }

  commitWithRolls(route: GoldenRoute, rolls: readonly number[]): FlowResult {
    let index = 0;
    return this.commitResult(this.run(route, () => rolls[index++]!));
  }

  private commitResult(result: FlowResult): FlowResult {
    if (result.attempted > 0) {
      for (const state of result.states) this.nodes.set(state.acupointRef, cloneNode(state));
      this.version += 1;
    }
    result.stateVersion = this.version;
    return result;
  }

  private run(route: GoldenRoute, nextRoll: () => number): FlowResult {
    const states = route.nodes.map((id) => cloneNode(this.nodes.get(id)!));
    for (let index = 0; index < states.length; index += 1) {
      const node = states[index]!;
      const reason = !node.opened ? 'unopened_node'
        : node.ruptureDamage > 0 ? 'ruptured_node'
          : node.sealLevel >= 9 ? 'point_seal_9' : null;
      if (reason !== null) {
        return { unitId: this.input.unitId, routeId: route.id, completed: 0, attempted: 0,
          routeQualityBp: 0, flowCt: 0, blockedAt: index, blockedNode: node.acupointRef,
          states, qualitiesBp: [], jamChancesBp: [], arrivalBp: [], trace: [],
          stateVersion: this.version, disabledReason: reason };
      }
    }
    const cultivation = this.input.cultivation;
    let currentQi = 120 + floorDivInt(G_BP[cultivation.grade]!, 50) + 10 * cultivation.layer;
    const gain = 30 + floorDivInt(G_BP[cultivation.grade]!, 500) + 3 * cultivation.layer;
    const result: FlowResult = { unitId: this.input.unitId, routeId: route.id, completed: 0,
      attempted: 0, routeQualityBp: 0, flowCt: 0, blockedAt: null, blockedNode: null,
      states, qualitiesBp: [], jamChancesBp: [], arrivalBp: [], trace: [],
      stateVersion: this.version, disabledReason: null };
    let arrivalBp = BP_SCALE;
    for (let index = 0; index < states.length; index += 1) {
      const node = states[index]!;
      result.attempted += 1; result.flowCt += route.segmentCt[index]!;
      const incoming = currentQi + gain;
      const effectiveFlowBp = mulDivFloor(
        node.flowBp, Math.max(0, BP_SCALE - node.stagnationBp - POINT_PENALTY[node.sealLevel]!), BP_SCALE,
      );
      const normalPass = Math.min(incoming, mulDivFloor(node.capacity, effectiveFlowBp, BP_SCALE));
      const chance = jamChanceBp(incoming, node, cultivation.practiceBp, route.riskBp[index]!);
      result.arrivalBp.push(arrivalBp); result.jamChancesBp.push(chance);
      const jammed = nextRoll() < chance;
      const passed = jammed ? mulDivFloor(normalPass, 4000, BP_SCALE) : normalPass;
      result.trace.push({ acupointRef: node.acupointRef, incoming, passed, jamChanceBp: chance });
      const excess = Math.max(0, incoming - passed);
      node.water = passed; node.backlog += excess;
      node.stagnationBp = clampInt(node.stagnationBp
        + ceilDivInt(excess * 2500, Math.max(1, node.capacity)) + (jammed ? 1000 : 0), 0, 9500);
      const threshold = mulDivFloor(
        node.capacity, 12_000 - floorDivInt(Math.min(node.stagnationBp, 6000), 2), BP_SCALE,
      );
      if (node.backlog >= threshold) {
        node.ruptureDamage = Math.max(
          node.ruptureDamage, floorDivInt(node.capacity, 2) + node.backlog - threshold,
        );
      }
      if (jammed || node.ruptureDamage > 0) {
        result.blockedAt = index; result.blockedNode = node.acupointRef;
        break;
      }
      const fillBp = Math.min(BP_SCALE, floorDivInt(passed * BP_SCALE, Math.max(1, node.capacity)));
      result.qualitiesBp.push(mulDivFloor(fillBp, effectiveFlowBp, BP_SCALE));
      result.completed += 1; currentQi = passed;
      arrivalBp = mulDivFloor(arrivalBp, BP_SCALE - chance, BP_SCALE);
    }
    result.routeQualityBp = floorDivInt(
      result.qualitiesBp.reduce((sum, value) => sum + value, 0), states.length,
    );
    return result;
  }

  applySeal(acupoint: string, level: number, source = 'fixture', remaining = 2): void {
    const node = this.nodes.get(acupoint)!;
    const nextLevel = level > node.sealLevel ? level : Math.min(9, node.sealLevel + 1);
    const nextRemaining = Math.max(node.sealRemaining, remaining);
    node.sealLevel = nextLevel; node.sealSource = source; node.sealRemaining = nextRemaining;
    this.version += 1;
  }

  regulateBreath(rng?: Rng, targetWill = 0, medical = 0): Record<string, Json> {
    const grade = 12;
    const layer = 10;
    const reliefBp = clampInt(mulDivFloor(
      500 + 100 * grade + 80 * layer, 10_500, BP_SCALE,
    ), 500, 2500);
    const repair = mulDivFloor(120 + 24 * grade + 18 * layer, 10_500, BP_SCALE);
    const ranked = [...this.nodes.values()].sort((left, right) =>
      Number(left.ruptureDamage <= 0) - Number(right.ruptureDamage <= 0)
      || right.sealLevel - left.sealLevel || right.stagnationBp - left.stagnationBp
      || right.backlog - left.backlog || compareCodePoints(left.acupointRef, right.acupointRef));
    const touched = ranked.slice(0, 3);
    let stagnationRemovedBp = 0;
    let backlogRemoved = 0;
    let ruptureRepaired = 0;
    let sealsReduced = 0;
    for (const node of touched) {
      const oldStagnation = node.stagnationBp;
      const oldBacklog = node.backlog;
      const oldDamage = node.ruptureDamage;
      const oldSeal = node.sealLevel;
      node.stagnationBp = Math.max(0, node.stagnationBp - reliefBp);
      node.backlog = Math.max(0, node.backlog - Math.max(
        1, mulDivFloor(node.capacity, reliefBp, BP_SCALE),
      ));
      node.ruptureDamage = Math.max(0, node.ruptureDamage - repair);
      const eligible = node.sealLevel > 0 && grade + layer >= node.sealLevel + 6;
      if (eligible) {
        if (rng === undefined) throw new RangeError('GOLDEN_SELF_UNSEAL_RNG');
        const releaseBp = pointReleaseBp(node.sealLevel, grade, layer, medical, targetWill);
        if (rng.nextU32() % BP_SCALE < releaseBp) node.sealLevel -= 1;
      }
      if (node.sealLevel === 0) {
        node.sealSource = null; node.sealRemaining = 0;
      }
      node.water = 0;
      stagnationRemovedBp += oldStagnation - node.stagnationBp;
      backlogRemoved += oldBacklog - node.backlog;
      ruptureRepaired += oldDamage - node.ruptureDamage;
      sealsReduced += oldSeal - node.sealLevel;
    }
    this.version += 1;
    return { touched: touched.map((node) => node.acupointRef), stagnationRemovedBp,
      backlogRemoved, ruptureRepaired, sealsReduced, ct: 1000, mpCostBp: 0 };
  }
}

function routeReachBp(length: number): number {
  return Math.min(BP_SCALE, 3000 + floorDivInt(7000 * length, 18));
}

function strengthBp(profile: Profile): number {
  const weighted = 30 * clampInt(profile.qiBp, 4000, 18_000)
    + 25 * clampInt(profile.capacityBp, 4000, 18_000)
    + 25 * clampInt(profile.flowBp, 4000, 18_000)
    + 20 * clampInt(profile.completionBp, 0, 18_000);
  return clampInt(floorDivInt(weighted, 100), 4000, 18_000);
}

function multiplier(
  self: Profile, opponent: Profile, routeLength: number,
  curve: readonly (readonly [number, number])[], min: number, max: number,
): number {
  const ratio = clampInt(mulDivFloor(
    strengthBp(self), BP_SCALE, strengthBp(opponent),
  ), 4000, 25_000);
  const target = interpolate(ratio, curve);
  const completion = ratio >= BP_SCALE ? self.completionBp : opponent.completionBp;
  const qualityReach = clampInt(5000 + floorDivInt(completion, 2), 5000, BP_SCALE);
  const realise = mulDivFloor(routeReachBp(routeLength), qualityReach, BP_SCALE);
  const result = target >= BP_SCALE
    ? BP_SCALE + mulDivFloor(target - BP_SCALE, realise, BP_SCALE)
    : BP_SCALE - mulDivFloor(BP_SCALE - target, realise, BP_SCALE);
  return clampInt(result, min, max);
}

function attackBp(attacker: Profile, defender: Profile, length: number): number {
  return multiplier(attacker, defender, length, ATTACK_CURVE, 6500, 22_000);
}

function defenseBp(defender: Profile, attacker: Profile, length: number): number {
  return multiplier(defender, attacker, length, DEFENSE_CURVE, 5000, 13_000);
}

function speedBp(self: Profile, reference: Profile, sealed = false): number {
  const ratio = clampInt(mulDivFloor(
    strengthBp(self), BP_SCALE, strengthBp(reference),
  ), 4000, 18_000);
  const target = interpolate(ratio, SPEED_CURVE);
  return clampInt(sealed ? Math.min(target, 6500) : target, 6500, 13_500);
}

function normalize(raw: readonly number[], standard: readonly number[]): Profile {
  const component = (index: number, min = 4000) =>
    clampInt(mulDivFloor(raw[index]!, BP_SCALE, standard[index]!), min, 18_000);
  return { qiBp: component(0), capacityBp: component(1), flowBp: component(2),
    completionBp: component(3, 0) };
}

function pointReleaseBp(
  level: number, healerGrade: number, healerLayer: number, medical: number, targetWill: number,
): number {
  return clampInt(3500 + 250 * healerGrade + 100 * healerLayer + 20 * medical
    + 10 * targetWill - 700 * level, 500, 9500);
}

function resultVector(result: FlowResult, baseDamage: number): Json {
  const blocked = result.blockedAt === null ? null : result.states[result.blockedAt]!;
  return { unitId: result.unitId, routeId: result.routeId, completed: result.completed,
    attempted: result.attempted, routeQualityBp: result.routeQualityBp, flowCt: result.flowCt,
    baseDamage, blockedAt: result.blockedAt, blockedNode: result.blockedNode,
    disabledReason: result.disabledReason, jamChancesBp: result.jamChancesBp,
    arrivalBp: result.arrivalBp, stateVersion: result.stateVersion,
    qualitiesBp: result.qualitiesBp, trace: result.trace, blockedState: blocked };
}

function grapple(level: number): Json {
  const index = level - 1;
  return { level,
    moveBp: [10_000, 9000, 8000, 7000, 6000, 5000, 3500, 2000, 0][index]!,
    recoveryAdd: [50, 100, 150, 200, 250, 300, 400, 500, 0][index]!,
    strBp: [9500, 9000, 8500, 8000, 7500, 7000, 6000, 5000, 0][index]!,
    agiBp: [9500, 9000, 8500, 8000, 7500, 7000, 6000, 5000, 0][index]!,
    evadeBp: [9500, 9000, 8500, 8000, 7500, 7000, 6000, 5000, 0][index]!,
    weaponLocked: level >= 7, actionLocked: level === 9 };
}

function point(level: number): Json {
  return { level, flowPenaltyBp: POINT_PENALTY[level]!,
    mpCostAddBp: [300, 600, 900, 1200, 1600, 2000, 2500, 3000, 0][level - 1]!,
    innerLocked: level >= 8, breathLocked: level === 9 };
}

function innerGuard(
  incoming: number, defender: Profile, attacker: Profile,
  damageKind = 'unarmed', mp = 10_000, reflectBp = 0,
): Json {
  const eligibility: Record<string, number> = {
    unarmed: 10_000, weapon: 2500, hidden: 0, projected: 4000,
  };
  const eligibleIncoming = mulDivFloor(incoming, eligibility[damageKind]!, BP_SCALE);
  const capacity = floorDivInt(strengthBp(defender) * clampInt(defender.flowBp, 4000, 18_000), 100_000);
  const cancelled = Math.min(eligibleIncoming, capacity, mp * 2);
  const overflow = Math.max(0, eligibleIncoming - cancelled);
  const broken = cancelled < eligibleIncoming;
  return { eligibleIncoming, capacity, cancelled, damageBeforeMpGuard: incoming - cancelled,
    mpSpent: ceilDivInt(cancelled, 2), broken,
    delayCt: broken ? 150 + Math.min(250, floorDivInt(overflow * 250, Math.max(1, cancelled))) : 0,
    stagnationBp: broken ? 800 + Math.min(2200, floorDivInt(overflow * 2200, Math.max(1, cancelled))) : 0,
    reflectDamage: mulDivFloor(cancelled, reflectBp, BP_SCALE) };
}

function speedVector(multBp: number, grappleBp = BP_SCALE): Record<string, Json> {
  const combined = mulDivFloor(multBp, grappleBp, BP_SCALE);
  const delta = combined - BP_SCALE;
  const direction = delta >= 0 ? 1 : -1;
  return { spd: clampInt(mulDivFloor(106, combined, BP_SCALE), 30, 300),
    move: clampInt(6 + clampInt(direction * floorDivInt(Math.abs(delta), 1500), -2, 2), 1, 10),
    openingQinggong: Math.max(0, mulDivFloor(98, combined, BP_SCALE)),
    evadeRatingDelta: clampInt(floorDivInt(multBp - BP_SCALE, 100), -35, 35) };
}

function damageVector(
  baseDamage: number, attacker: Profile, defender: Profile, defenseLength = 0,
): { damage: number; attackMultBp: number; defenseMultBp: number } {
  const attackMultBp = attackBp(attacker, defender, 10);
  const defenseMultBp = defenseLength > 0 ? defenseBp(defender, attacker, defenseLength) : BP_SCALE;
  const afterDefense = mulDivFloor(baseDamage, defenseMultBp, BP_SCALE);
  return { damage: mulDivFloor(afterDefense, attackMultBp, BP_SCALE),
    attackMultBp, defenseMultBp };
}

function ttk(hp: number, damage: number, teamBp = BP_SCALE): number {
  return ceilDivInt(hp * BP_SCALE, damage * teamBp);
}

function createUnits(inputs: LegacyProtocol2Inputs): Record<string, GoldenUnitRuntime> {
  const allAcupoints = [...new Set(inputs.routes.flatMap((route) => route.nodes))];
  return Object.fromEntries(Object.entries(inputs.units).map(([key, input]) =>
    [key, new GoldenUnitRuntime(input, allAcupoints)]));
}

/** Replays the pre-protocol-3 recording with its retired 600..2600 model. */
export function runLegacyProtocol2Replay(
  inputs: LegacyProtocol2Inputs, masterSeed: number,
): Record<string, Json> {
  const units = createUnits(inputs);
  const routes = Object.fromEntries(inputs.routes.map((route) => [route.id, route]));
  const short = routes['mfr_half_step_crush']!;
  const long = routes['mfr_eighteen_palms_chain']!;
  const novice = routes['mfr_novice_eight']!;
  const forced = routes['mfr_forced_six']!;
  const defenseRoute = routes['mfr_guard_release']!;
  const movementRoute = routes['mfr_qinggong_cycle']!;
  const hero = units['hero']!;
  const rng = createRng(seedStream(masterSeed, 'battle'));
  const battleRngBefore = [...rng.snapshot()];
  const heroShortPreview = hero.preview(short, inputs.explicitRolls.clean);
  const heroLongCommit = hero.commitWithRolls(
    long, new Array<number>(long.nodes.length).fill(inputs.explicitRolls.clean),
  );
  const seededHero = createUnits(inputs)['hero']!;
  const heroSeededCommit = seededHero.commit(long, rng);
  const battleRngAfterHeroCommit = [...rng.snapshot()];
  const normalShort = units['normal']!.commit(short, rng);
  const eliteLong = units['elite']!.commit(long, rng);
  const bossLong = units['boss']!.commit(long, rng);
  const battleRngAfterAllUnitCommits = [...rng.snapshot()];
  hero.applySeal(short.nodes[0]!, 3);
  const selfUnseal = hero.regulateBreath(rng, 70, 60);
  const selfUnsealLevelAfter = hero.nodes.get(short.nodes[0]!)!.sealLevel;

  const jamUnit = createUnits(inputs)['normal']!;
  const jamNode = jamUnit.nodes.get(novice.nodes[3]!)!;
  jamNode.stagnationBp = 4000; jamNode.backlog = 600;
  const jamRolls = new Array<number>(novice.nodes.length).fill(inputs.explicitRolls.clean);
  jamRolls[3] = inputs.explicitRolls.forcedJam;
  const jammed = jamUnit.commitWithRolls(novice, jamRolls);
  const ruptureUnit = createUnits(inputs)['normal']!;
  const ruptureNode = ruptureUnit.nodes.get(forced.nodes[2]!)!;
  ruptureNode.stagnationBp = 6000; ruptureNode.backlog = 1100;
  const ruptureRolls = new Array<number>(forced.nodes.length).fill(inputs.explicitRolls.clean);
  ruptureRolls[2] = inputs.explicitRolls.forcedJam;
  const ruptured = ruptureUnit.commitWithRolls(forced, ruptureRolls);
  const breath = ruptureUnit.regulateBreath();
  const sealedUnit = createUnits(inputs)['hero']!;
  sealedUnit.applySeal(long.nodes[4]!, 9);
  const sealed = sealedUnit.preview(long);
  const defenseFlow = createUnits(inputs)['hero']!.preview(defenseRoute);
  const movementFlow = createUnits(inputs)['hero']!.preview(movementRoute);

  const baseDamage: Record<string, number> = { normal: 849, elite: 950, boss: 2574 };
  const matchupInputs = [
    ['equal', STANDARD, STANDARD, 3970, 849, BP_SCALE],
    ['strongOneTier', STRONG, STANDARD, 8000, 950, BP_SCALE],
    ['strongTwoTiers', VERY_STRONG, STANDARD, 170_773, 2574, 31_000],
    ['weakOneTier', WEAK, STANDARD, 3970, 849, BP_SCALE],
    ['masterVsMob', VERY_STRONG, MOB, 2200, 849, BP_SCALE],
  ] as const;
  const matchups: Record<string, Json> = {};
  for (const [name, attacker, defender, hp, base, teamBp] of matchupInputs) {
    const damage = damageVector(base, attacker, defender);
    matchups[name] = { attackerStrengthBp: strengthBp(attacker),
      defenderStrengthBp: strengthBp(defender), ...damage, baseDamage: base, targetHp: hp,
      teamEquivBp: teamBp, ttkBeforeActions: ttk(hp, base, teamBp),
      ttkActions: ttk(hp, damage.damage, teamBp) };
  }
  const defended = damageVector(1000, STANDARD, STRONG, 6);
  const raw: number[] = [320, 1240, 8650, 4230];
  const equalProfile = normalize(raw, raw);
  const equalSpeedBp = speedBp(STANDARD, STANDARD);
  const strongSpeedBp = speedBp(VERY_STRONG, STANDARD);
  const sealedSpeedBp = speedBp(VERY_STRONG, STANDARD, true);
  return {
    battleRngBefore, battleRngAfterHeroCommit, battleRngAfterAllUnitCommits,
    battleRngAfterSelfUnseal: [...rng.snapshot()],
    heroShortPreview: resultVector(heroShortPreview, baseDamage['normal']!),
    heroLongCommit: resultVector(heroLongCommit, baseDamage['normal']!),
    heroSeededCommit: resultVector(heroSeededCommit, baseDamage['normal']!),
    normalShort: resultVector(normalShort, baseDamage['normal']!),
    eliteLong: resultVector(eliteLong, baseDamage['elite']!),
    bossLong: resultVector(bossLong, baseDamage['boss']!),
    jammed: resultVector(jammed, baseDamage['normal']!),
    ruptured: resultVector(ruptured, baseDamage['normal']!),
    breath, selfUnseal, selfUnsealLevelAfter,
    sealed: resultVector(sealed, baseDamage['normal']!),
    defenseRouteFlow: resultVector(defenseFlow, baseDamage['normal']!),
    movementRouteFlow: resultVector(movementFlow, baseDamage['normal']!),
    matchups,
    normalization: { rawAndStandard: raw, equalProfile, equalStrengthBp: strengthBp(equalProfile) },
    defenseRoute: { incoming: 1000, ...defended },
    innerGuardHold: innerGuard(1000, STRONG, STANDARD, 'unarmed', 2000, 1000),
    innerGuardBreak: innerGuard(1600, STANDARD, VERY_STRONG, 'unarmed', 300),
    innerGuardCapacityBreak: innerGuard(1600, STANDARD, VERY_STRONG, 'unarmed', 2000),
    innerGuardKinds: Object.fromEntries(['unarmed', 'weapon', 'hidden', 'projected']
      .map((kind) => [kind, innerGuard(1000, STANDARD, STANDARD, kind)])),
    speed: {
      equal: { multBp: equalSpeedBp, ...speedVector(equalSpeedBp) },
      strong: { multBp: strongSpeedBp, ...speedVector(strongSpeedBp) },
      sealed: { multBp: sealedSpeedBp, ...speedVector(sealedSpeedBp) },
      grappledStrong: { multBp: strongSpeedBp, grappleMoveBp: 6000,
        ...speedVector(strongSpeedBp, 6000) },
      maxActionsPer1000Ticks: ceilDivInt(300 * 1000, 500),
    },
    grapple1: grapple(1), grapple9: grapple(9),
    escapeLevel6Bp: clampInt(5000 + 40 * ((70 + 65) - (75 + 70)) + 150 * 8 - 650 * 6, 500, 9500),
    point1: point(1), point9: point(9),
  };
}
