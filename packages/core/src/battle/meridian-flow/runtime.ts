import { BP_SCALE, ceilDivInt, clampInt, compareCodePoints, floorDivInt, mulDivFloor } from '@tianshu/shared';
import { chanceBp, type Rng } from '../../rng';
import type { AcupointOccupancy, ForeignQiInstance } from '../damage/meridian-effects';
import {
  attackMeridianBp, circulationDamageBp, defenseMeridianBp, effectiveNodeFlowBp,
  finalMeridianAttackBp, jamChanceBp, meridianStrengthBp, normalizeMeridianProfile,
  segmentTravelTicks, speedMeridianBp,
} from './math';
import type {
  CommitQiMoveInput, FullCycleCritEvent, MeridianFlowInput, MeridianFlowPreview, MeridianProfile,
  PreviewOptions, QiFlowTraceStep, QiGatherStatus, QiMoveResolution, RawMeridianProfile, ResolveQiMoveInput,
  ResolveQiMoveResult,
} from './types';

interface MutableTraceStep {
  readonly acupointRef: string;
  incoming: number;
  passed: number;
  fluxCap: number;
  effectiveFlowBp: number;
  jamChanceBp: number;
  jammed: boolean;
}

interface MutableMeridianProfile {
  qiBp: number;
  widthBp: number;
  flowBp: number;
  completionBp: number;
}

interface PreviewScratch extends Omit<MeridianFlowPreview, 'profile' | 'trace'> {
  readonly qualitiesBp: number[];
  readonly jamChancesBp: number[];
  readonly arrivalBp: number[];
  readonly profile: MutableMeridianProfile;
  readonly trace: MutableTraceStep[];
}

const STANDARD_PROFILE: MeridianProfile = {
  qiBp: BP_SCALE, widthBp: BP_SCALE, flowBp: BP_SCALE, completionBp: BP_SCALE,
};

interface CompiledRoute {
  readonly id: string;
  readonly purpose: 'attack' | 'defense' | 'movement';
  readonly nodeIndexes: Int16Array;
  readonly travelTicks: Int16Array;
  readonly segmentCt: Int16Array;
  readonly riskBp: Int16Array;
  readonly carryCap: number;
  readonly travelTotal: number;
  readonly releaseRate: number;
  readonly previewReference: RawMeridianProfile;
  readonly startedAtTick: number;
  windowTicks: number;
  totalQi: number;
  readonly pipelineQi: Int32Array;
  readonly slotFlowNodeIndexes: Int16Array;
  readonly slotNodeIndexes: Int16Array;
  readonly slotStepIndexes: Int16Array;
  readonly preview: PreviewScratch;
}

export interface MeridianFlowSnapshot {
  readonly schema: 'meridian-flow-state.v2';
  readonly rulesProtocol: 3; readonly unitId: string; readonly unitIndex: number;
  readonly kind: 'hero' | 'normal' | 'elite' | 'boss' | 'summon' | 'environment';
  readonly tick: number;
  readonly dantianQi: number;
  readonly activeRouteId: string | null;
  readonly stateVersion: number;
  readonly routes: readonly { readonly routeId: string; readonly windowTicks: number;
    readonly totalQi: number; readonly pipelineQi: readonly number[] }[];
  readonly nodes: readonly { readonly acupointRef: string; readonly inFlightQi: number;
    readonly opened: boolean; readonly fluxCap: number; readonly lengthUnit: number; readonly flowBp: number;
    readonly stagnationBp: number; readonly backlog: number; readonly ruptureDamage: number;
    readonly sealLevel: number }[];
  readonly grappleLevel: number; readonly grappleSource: string | null; readonly grappleRemaining: number;
  readonly foreignQi: readonly ForeignQiInstance[];
  readonly acupointOccupancies: readonly AcupointOccupancy[];
  readonly redirectedQi: number; readonly redirectedQiExpiresAtOwnAction: number | null;
}

export interface MeridianFlowTransientState {
  readonly foreignQi: readonly ForeignQiInstance[];
  readonly acupointOccupancies: readonly AcupointOccupancy[];
  readonly redirectedQi: number;
  readonly redirectedQiExpiresAtOwnAction: number | null;
}

export interface MeridianFlowAdvancedEvent {
  readonly t: 'qi.flowAdvanced';
  readonly unitId: string;
  readonly ticks: number;
  readonly battleTick: number;
  readonly stateVersion: number;
}

const FULL_CYCLE_MESSAGES = [
  '运转一周天，内劲喷涌而出，难以抵挡',
  '真气周流不息，招至而劲已贯通',
  '一周天功成，蓄势真气奔涌而出',
  '经脉圆转无滞，雄浑内劲直贯敌身',
  '丹田气走周天，此击劲力浑然一体',
  '真气循脉归圆，出手之际内劲勃发',
] as const;

function assertIntRange(value: number, min: number, max: number, code: string): void {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError(code);
}

function messageIndex(causeId: string, moveId: string): number {
  let hash = 2166136261;
  const value = `${causeId}\0${moveId}`;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619) >>> 0;
  }
  return hash % FULL_CYCLE_MESSAGES.length;
}

export class MeridianFlowRuntime {
  readonly unitId: string;
  readonly productionPerTick: number;
  readonly qiSpeedBp: number;
  readonly practiceBp: number;
  readonly unitQiHardCap: number;
  private tickNo = 0;
  private version = 0;
  private dantianQi = 0;
  private activeRouteIndex = -1;
  private readonly nodeIds: readonly string[];
  private readonly opened: Uint8Array;
  private readonly fluxCap: Int16Array;
  private readonly lengthUnit: Int16Array;
  private readonly flowBp: Int16Array;
  private readonly stagnationBp: Int16Array;
  private readonly backlog: Int32Array;
  private readonly ruptureDamage: Int32Array;
  private readonly sealLevel: Uint8Array;
  private readonly nodeInFlight: Int32Array;
  private readonly routes: readonly CompiledRoute[];
  private readonly routeById: ReadonlyMap<string, CompiledRoute>;
  private unitIndex = 0;
  private unitKind: MeridianFlowSnapshot['kind'] = 'normal';
  private grappleLevel = 0;
  private grappleSource: string | null = null;
  private grappleRemaining = 0;
  private foreignQi: readonly ForeignQiInstance[] = [];
  private acupointOccupancies: readonly AcupointOccupancy[] = [];
  private redirectedQi = 0;
  private redirectedQiExpiresAtOwnAction: number | null = null;

  get battleTick(): number { return this.tickNo; }

  get stateVersion(): number { return this.version; }

  projectOccupancies(foreignQi: readonly ForeignQiInstance[], occupancies: readonly AcupointOccupancy[]): void {
    this.foreignQi = foreignQi; this.acupointOccupancies = occupancies;
  }

  projectSeal(acupointRef: string, level: number): void {
    assertIntRange(level, 0, 9, 'QI_SEAL_LEVEL');
    const index = this.nodeIds.indexOf(acupointRef);
    if (index >= 0 && this.sealLevel[index] !== level) {
      this.sealLevel[index] = level; this.version += 1;
    }
  }

  private nodeOccupied(nodeIndex: number): boolean {
    const id = this.nodeIds[nodeIndex];
    for (const occupancy of this.acupointOccupancies) {
      if (occupancy.occupyingQi > 0 && occupancy.acupointRef === id) return true;
    }
    for (const foreign of this.foreignQi) {
      const current = foreign.reversePath[foreign.stepIndex]?.acupointRef ?? foreign.injectionAcupoint;
      if (foreign.remainingQi > 0 && current === id) return true;
    }
    return false;
  }

  private routeOccupied(route: CompiledRoute): boolean {
    for (const index of route.nodeIndexes) if (this.nodeOccupied(index)) return true;
    for (const occupancy of this.acupointOccupancies) {
      if (occupancy.occupyingQi > 0 && occupancy.affectedRouteRefs.includes(route.id)) return true;
    }
    return false;
  }

  setIdentity(unitIndex: number, kind: MeridianFlowSnapshot['kind']): void {
    assertIntRange(unitIndex, 0, 1_000_000, 'QI_UNIT_INDEX');
    this.unitIndex = unitIndex; this.unitKind = kind;
  }

  constructor(input: MeridianFlowInput) {
    assertIntRange(input.productionPerTick, 1, 64, 'QI_PRODUCTION_RANGE');
    assertIntRange(input.qiSpeedBp, 1000, 20000, 'QI_SPEED_RANGE');
    assertIntRange(input.practiceBp, 3500, 9800, 'QI_PRACTICE_RANGE');
    if ((input.nodes.length === 0) !== (input.routes.length === 0)) throw new RangeError('QI_EMPTY_INPUT');
    const orderedNodes = [...input.nodes].sort((a, b) => compareCodePoints(a.acupointRef, b.acupointRef));
    this.unitId = input.unitId;
    this.productionPerTick = input.productionPerTick;
    this.qiSpeedBp = input.qiSpeedBp;
    this.practiceBp = input.practiceBp;
    this.nodeIds = orderedNodes.map((node) => node.acupointRef);
    this.opened = new Uint8Array(orderedNodes.length);
    this.fluxCap = new Int16Array(orderedNodes.length);
    this.lengthUnit = new Int16Array(orderedNodes.length);
    this.flowBp = new Int16Array(orderedNodes.length);
    this.stagnationBp = new Int16Array(orderedNodes.length);
    this.backlog = new Int32Array(orderedNodes.length);
    this.ruptureDamage = new Int32Array(orderedNodes.length);
    this.sealLevel = new Uint8Array(orderedNodes.length);
    this.nodeInFlight = new Int32Array(orderedNodes.length);
    const nodeIndex = new Map<string, number>();
    for (let index = 0; index < orderedNodes.length; index += 1) {
      const node = orderedNodes[index]!;
      if (nodeIndex.has(node.acupointRef)) throw new RangeError('QI_NODE_DUPLICATE');
      assertIntRange(node.fluxCap, 1, 64, 'QI_FLUX_RANGE');
      assertIntRange(node.lengthUnit, 1, 12, 'QI_LENGTH_RANGE');
      assertIntRange(node.flowBp, 3000, 10000, 'QI_FLOW_RANGE');
      this.opened[index] = node.opened ? 1 : 0;
      this.fluxCap[index] = node.fluxCap;
      this.lengthUnit[index] = node.lengthUnit;
      this.flowBp[index] = node.flowBp;
      this.stagnationBp[index] = node.stagnationBp ?? 0;
      this.backlog[index] = node.backlog ?? 0;
      this.ruptureDamage[index] = node.ruptureDamage ?? 0;
      this.sealLevel[index] = node.sealLevel ?? 0;
      nodeIndex.set(node.acupointRef, index);
    }
    const orderedRoutes = [...input.routes].sort((a, b) => compareCodePoints(a.routeId, b.routeId));
    this.routes = orderedRoutes.map((route, routeOrdinal) => {
      if (route.steps.length < 1 || route.steps.length > 18) throw new RangeError('QI_ROUTE_LENGTH');
      const indexes = new Int16Array(route.steps.length);
      const lengths = new Int16Array(route.steps.length);
      const segmentCt = new Int16Array(route.steps.length);
      const riskBp = new Int16Array(route.steps.length);
      const seen = new Set<number>();
      let carryCap = 0;
      let bottleneck = 64;
      for (let stepIndex = 0; stepIndex < route.steps.length; stepIndex += 1) {
        const step = route.steps[stepIndex]!;
        const index = nodeIndex.get(step.acupointRef);
        if (index === undefined) throw new RangeError('QI_ROUTE_UNKNOWN_NODE');
        if (seen.has(index)) throw new RangeError('QI_ROUTE_NODE_DUPLICATE');
        if (step.lengthUnit !== this.lengthUnit[index]) throw new RangeError('QI_ROUTE_LENGTH_MISMATCH');
        assertIntRange(step.segmentCt, 40, 120, 'QI_SEGMENT_CT_RANGE');
        assertIntRange(step.riskBp, 0, 1200, 'QI_RISK_RANGE');
        indexes[stepIndex] = index; lengths[stepIndex] = step.lengthUnit;
        segmentCt[stepIndex] = step.segmentCt; riskBp[stepIndex] = step.riskBp;
        carryCap += this.fluxCap[index]! * step.lengthUnit;
        bottleneck = Math.min(bottleneck, this.fluxCap[index]!);
        seen.add(index);
      }
      const travel = segmentTravelTicks(lengths, input.qiSpeedBp);
      const travelTotal = travel.reduce((sum, value) => sum + value, 0);
      const speedThroughput = mulDivFloor(bottleneck, input.qiSpeedBp, BP_SCALE);
      const previewReference = route.previewReference ?? { releasedQi: carryCap,
        meanFluxCap: bottleneck, meanFlowBp: BP_SCALE, routeQualityBp: BP_SCALE };
      for (const value of [previewReference.releasedQi, previewReference.meanFluxCap,
        previewReference.meanFlowBp, previewReference.routeQualityBp]) {
        assertIntRange(value, 1, Number.MAX_SAFE_INTEGER, 'QI_PREVIEW_REFERENCE_ZERO');
      }
      const slotFlowNodeIndexes = new Int16Array(travelTotal);
      const slotNodeIndexes = new Int16Array(travelTotal);
      const slotStepIndexes = new Int16Array(travelTotal + 1);
      slotNodeIndexes.fill(-1);
      let slot = 0;
      for (let stepIndex = 0; stepIndex < travel.length; stepIndex += 1) {
        const ticks = travel[stepIndex]!;
        for (let offset = 0; offset < ticks; offset += 1) {
          slotFlowNodeIndexes[slot] = indexes[stepIndex]!;
          slotStepIndexes[slot] = stepIndex;
          if (offset === ticks - 1) slotNodeIndexes[slot] = indexes[stepIndex]!;
          slot += 1;
        }
      }
      slotStepIndexes[travelTotal] = route.steps.length;
      const preview: PreviewScratch = {
        unitId: input.unitId, routeId: route.routeId, attempted: 0, completed: 0, flowCt: 0,
        routeQualityBp: 0, releasedQi: 0, routeCarryCap: carryCap, circulationBp: 0,
        blockedAt: null, blockedNode: null, disabledReason: null,
        qualitiesBp: new Array<number>(route.steps.length).fill(0),
        jamChancesBp: new Array<number>(route.steps.length).fill(0),
        arrivalBp: new Array<number>(route.steps.length).fill(0),
        stateVersion: 0,
        profile: { ...STANDARD_PROFILE },
        attackerStrengthBp: BP_SCALE, defenderStrengthBp: BP_SCALE,
        meridianAttackBp: BP_SCALE, meridianDefenseBp: BP_SCALE, meridianSpeedBp: BP_SCALE,
        trace: route.steps.map((step) => ({
          acupointRef: step.acupointRef, incoming: 0, passed: 0, fluxCap: 0,
          effectiveFlowBp: 0, jamChanceBp: 0, jammed: false,
        })),
      };
      return { id: route.routeId, purpose: route.purpose ?? 'attack',
        nodeIndexes: indexes, travelTicks: travel, segmentCt, riskBp,
        carryCap, travelTotal, releaseRate: Math.min(input.productionPerTick, bottleneck, speedThroughput),
        previewReference,
        startedAtTick: routeOrdinal, windowTicks: 0, totalQi: 0,
        pipelineQi: new Int32Array(travelTotal + 1), slotFlowNodeIndexes, slotNodeIndexes,
        slotStepIndexes, preview };
    });
    this.routeById = new Map(this.routes.map((route) => [route.id, route]));
    this.unitQiHardCap = input.unitQiHardCap
      ?? (this.routes.length === 0 ? 0 : Math.max(...this.routes.map((route) => route.carryCap)));
    if (input.activeRouteId !== undefined) this.selectRoute(input.activeRouteId);
  }

  validateRoute(routeId: string): void {
    const index = this.routes.findIndex((route) => route.id === routeId);
    if (index < 0) throw new RangeError('QI_ROUTE_UNKNOWN');
    const route = this.routes[index]!;
    if (this.routeOccupied(route)) throw new RangeError('QI_ROUTE_OCCUPIED');
    for (const nodeIndex of route.nodeIndexes) {
      if (this.opened[nodeIndex] === 0) throw new RangeError('QI_ROUTE_UNOPENED');
      if (this.ruptureDamage[nodeIndex]! > 0) throw new RangeError('QI_ROUTE_RUPTURED');
      if (this.sealLevel[nodeIndex]! >= 9) throw new RangeError('QI_ROUTE_SEALED');
    }
  }

  validateAttackRoute(routeId: string): void {
    this.validateRoute(routeId);
    const route = this.routes.find((candidate) => candidate.id === routeId)!;
    if (route.purpose !== 'attack') throw new RangeError('QI_ROUTE_NOT_ATTACK');
  }

  queryGatherStatus(routeId: string): QiGatherStatus {
    this.validateAttackRoute(routeId);
    const route = this.routeById.get(routeId)!;
    let totalInFlightQi = 0;
    for (let index = 0; index < this.routes.length; index += 1) {
      totalInFlightQi += this.routes[index]!.totalQi;
    }
    const circulationBp = Math.min(
      BP_SCALE, mulDivFloor(route.windowTicks, BP_SCALE, route.travelTotal),
    );
    const canInject = route.totalQi < route.carryCap
      && (this.dantianQi > 0 || this.totalStoredQi() < this.unitQiHardCap);
    const canAdvance = route.totalQi > 0 && circulationBp < BP_SCALE;
    return { unitId: this.unitId, routeId, purpose: route.purpose, dantianQi: this.dantianQi,
      routeInFlightQi: route.totalQi, totalInFlightQi, routeCarryCap: route.carryCap,
      unitQiHardCap: this.unitQiHardCap, circulationBp, canInject, canAdvance,
      full: !canInject && !canAdvance };
  }

  routeReference(routeId: string): RawMeridianProfile {
    const route = this.routeById.get(routeId);
    if (route === undefined) throw new RangeError('QI_ROUTE_UNKNOWN');
    return route.previewReference;
  }

  preview(routeId: string, options?: PreviewOptions): MeridianFlowPreview {
    const rollBp = options?.previewRollBp ?? 9999;
    assertIntRange(rollBp, 0, 9999, 'QI_PREVIEW_ROLL');
    const route = this.routeById.get(routeId);
    if (route === undefined) throw new RangeError('QI_ROUTE_UNKNOWN');
    const result = route.preview;
    result.attempted = 0; result.completed = 0; result.flowCt = 0;
    result.routeQualityBp = 0; result.releasedQi = 0;
    result.circulationBp = Math.min(
      BP_SCALE, mulDivFloor(route.windowTicks, BP_SCALE, route.travelTotal),
    );
    result.blockedAt = null; result.blockedNode = null; result.disabledReason = null;
    result.stateVersion = this.version;
    for (let stepIndex = 0; stepIndex < route.nodeIndexes.length; stepIndex += 1) {
      const nodeIndex = route.nodeIndexes[stepIndex]!;
      result.qualitiesBp[stepIndex] = 0;
      result.jamChancesBp[stepIndex] = 0;
      result.arrivalBp[stepIndex] = 0;
      const trace = result.trace[stepIndex]!;
      trace.incoming = 0; trace.passed = 0; trace.fluxCap = 0;
      trace.effectiveFlowBp = 0; trace.jamChanceBp = 0; trace.jammed = false;
      const disabled = this.opened[nodeIndex] === 0 ? 'unopened_node'
        : this.ruptureDamage[nodeIndex]! > 0 ? 'ruptured_node'
          : this.sealLevel[nodeIndex]! >= 9 ? 'point_seal_9'
            : this.nodeOccupied(nodeIndex) ? 'occupied_node' : null;
      if (disabled !== null && result.disabledReason === null) {
        result.blockedAt = stepIndex; result.blockedNode = this.nodeIds[nodeIndex]!;
        result.disabledReason = disabled;
      }
    }
    if (result.disabledReason === null && this.routeOccupied(route)) result.disabledReason = 'occupied_node';
    if (result.disabledReason !== null) {
      this.setPreviewMultipliers(route, result, options?.opponent, 0, 0);
      return result;
    }
    let incoming = Math.min(
      route.totalQi, route.carryCap, route.releaseRate * route.windowTicks, route.releaseRate,
    );
    let qualityTotal = 0;
    let effectiveFlowTotal = 0;
    let fluxTotal = 0;
    let arrivalBp = BP_SCALE;
    let outputLength = 0;
    for (let stepIndex = 0; stepIndex < route.nodeIndexes.length; stepIndex += 1) {
      const nodeIndex = route.nodeIndexes[stepIndex]!;
      const acupointRef = this.nodeIds[nodeIndex]!;
      result.attempted += 1;
      result.flowCt += route.segmentCt[stepIndex]!;
      const effectiveFlow = effectiveNodeFlowBp(
        this.flowBp[nodeIndex]!, this.stagnationBp[nodeIndex]!, this.sealLevel[nodeIndex]!,
      );
      const normalPass = Math.min(
        incoming, mulDivFloor(this.fluxCap[nodeIndex]!, effectiveFlow, BP_SCALE),
      );
      const chance = jamChanceBp(incoming, this.fluxCap[nodeIndex]!, this.practiceBp,
        route.riskBp[stepIndex]!, this.stagnationBp[nodeIndex]!, this.sealLevel[nodeIndex]!);
      const jammed = rollBp < chance;
      const passed = jammed ? mulDivFloor(normalPass, 4000, BP_SCALE) : normalPass;
      result.jamChancesBp[outputLength] = chance;
      result.arrivalBp[outputLength] = arrivalBp;
      const trace = result.trace[outputLength]!;
      trace.incoming = incoming; trace.passed = passed; trace.fluxCap = this.fluxCap[nodeIndex]!;
      trace.effectiveFlowBp = effectiveFlow; trace.jamChanceBp = chance; trace.jammed = jammed;
      outputLength += 1;
      if (jammed) {
        result.blockedAt = stepIndex; result.blockedNode = acupointRef;
        break;
      }
      const quality = mulDivFloor(
        Math.min(BP_SCALE, mulDivFloor(passed, BP_SCALE, Math.max(1, this.fluxCap[nodeIndex]!))),
        effectiveFlow, BP_SCALE,
      );
      result.qualitiesBp[result.completed] = quality;
      qualityTotal += quality; effectiveFlowTotal += effectiveFlow;
      fluxTotal += this.fluxCap[nodeIndex]!;
      result.completed += 1; incoming = passed;
      arrivalBp = mulDivFloor(arrivalBp, BP_SCALE - chance, BP_SCALE);
    }
    result.routeQualityBp = floorDivInt(qualityTotal, route.nodeIndexes.length);
    result.releasedQi = result.disabledReason === null
      ? Math.min(route.totalQi, route.carryCap, route.releaseRate * route.windowTicks) : 0;
    this.setPreviewMultipliers(route, result, options?.opponent, effectiveFlowTotal, fluxTotal);
    return result;
  }

  private setPreviewMultipliers(
    route: CompiledRoute, result: PreviewScratch, opponent = STANDARD_PROFILE,
    effectiveFlowTotal = 0, fluxTotal = 0,
  ): void {
    result.profile.qiBp = clampInt(mulDivFloor(
      result.releasedQi, BP_SCALE, route.previewReference.releasedQi), 4000, 18000);
    result.profile.widthBp = clampInt(mulDivFloor(
      result.completed > 0 ? floorDivInt(fluxTotal, result.completed) : 1,
      BP_SCALE, route.previewReference.meanFluxCap), 4000, 18000);
    result.profile.flowBp = clampInt(mulDivFloor(result.completed > 0
      ? floorDivInt(effectiveFlowTotal, result.completed) : 0,
    BP_SCALE, route.previewReference.meanFlowBp), 4000, 18000);
    result.profile.completionBp = clampInt(mulDivFloor(
      result.routeQualityBp, BP_SCALE, route.previewReference.routeQualityBp), 0, 18000);
    result.attackerStrengthBp = meridianStrengthBp(result.profile);
    result.defenderStrengthBp = meridianStrengthBp(opponent);
    result.meridianAttackBp = finalMeridianAttackBp(
      attackMeridianBp(result.profile, opponent, route.nodeIndexes.length), result.circulationBp,
    );
    result.meridianDefenseBp = defenseMeridianBp(result.profile, opponent, route.nodeIndexes.length);
    result.meridianSpeedBp = speedMeridianBp(result.profile, opponent);
  }

  selectRoute(routeId: string): void {
    this.validateRoute(routeId);
    const index = this.routes.findIndex((route) => route.id === routeId);
    this.activeRouteIndex = index;
    this.version += 1;
  }

  private totalStoredQi(): number {
    let total = this.dantianQi;
    for (let index = 0; index < this.routes.length; index += 1) {
      total += this.routes[index]!.totalQi;
    }
    return total;
  }

  private moveRoute(route: CompiledRoute): boolean {
    let changed = false;
    for (let slot = route.pipelineQi.length - 2; slot >= 0; slot -= 1) {
      const amount = route.pipelineQi[slot]!;
      if (amount <= 0) continue;
      const nodeIndex = route.slotFlowNodeIndexes[slot]!;
      const nextNodeIndex = route.slotNodeIndexes[slot + 1];
      if (nextNodeIndex !== undefined && nextNodeIndex >= 0 && this.nodeOccupied(nextNodeIndex)) continue;
      const effectiveFlow = effectiveNodeFlowBp(
        this.flowBp[nodeIndex]!, this.stagnationBp[nodeIndex]!, this.sealLevel[nodeIndex]!,
      );
      const nextRoom = nextNodeIndex === undefined || nextNodeIndex < 0
        || nextNodeIndex === route.slotNodeIndexes[slot]
        ? amount : this.fluxCap[nextNodeIndex]! * this.lengthUnit[nextNodeIndex]!
          - this.nodeInFlight[nextNodeIndex]!;
      const throughput = Math.max(0, Math.min(
        amount, mulDivFloor(this.fluxCap[nodeIndex]!, effectiveFlow, BP_SCALE),
        mulDivFloor(this.fluxCap[nodeIndex]!, this.qiSpeedBp, BP_SCALE),
        nextRoom,
      ));
      if (throughput <= 0) continue;
      changed = true;
      route.pipelineQi[slot] = route.pipelineQi[slot]! - throughput;
      route.pipelineQi[slot + 1] = route.pipelineQi[slot + 1]! + throughput;
      const currentNodeIndex = route.slotNodeIndexes[slot];
      if (currentNodeIndex !== undefined && currentNodeIndex >= 0) {
        this.nodeInFlight[currentNodeIndex] = this.nodeInFlight[currentNodeIndex]! - throughput;
      }
      if (nextNodeIndex !== undefined && nextNodeIndex >= 0 && nextNodeIndex !== currentNodeIndex) {
        this.nodeInFlight[nextNodeIndex] = this.nodeInFlight[nextNodeIndex]! + throughput;
      }
    }
    return changed;
  }

  private injectActiveRoute(): boolean {
    if (this.activeRouteIndex < 0 || this.dantianQi <= 0) return false;
    const route = this.routes[this.activeRouteIndex]!;
    if (this.routeOccupied(route)) return false;
    for (const index of route.nodeIndexes) {
      if (this.opened[index] === 0 || this.ruptureDamage[index]! > 0 || this.sealLevel[index]! >= 9) return false;
    }
    const nodeIndex = route.nodeIndexes[0]!;
    const effectiveFlow = effectiveNodeFlowBp(
      this.flowBp[nodeIndex]!, this.stagnationBp[nodeIndex]!, this.sealLevel[nodeIndex]!,
    );
    const effectiveFlux = mulDivFloor(this.fluxCap[nodeIndex]!, effectiveFlow, BP_SCALE);
    const speedFlux = mulDivFloor(this.fluxCap[nodeIndex]!, this.qiSpeedBp, BP_SCALE);
    const residentNode = route.slotNodeIndexes[0];
    const residentRoom = residentNode !== undefined && residentNode >= 0
      ? this.fluxCap[residentNode]! * this.lengthUnit[residentNode]!
        - this.nodeInFlight[residentNode]!
      : this.unitQiHardCap;
    const admitted = Math.max(0, Math.min(
      this.dantianQi, this.fluxCap[nodeIndex]!, effectiveFlux, speedFlux, route.releaseRate,
      route.carryCap - route.totalQi, residentRoom,
    ));
    if (admitted <= 0) return false;
    this.dantianQi -= admitted;
    route.pipelineQi[0] = route.pipelineQi[0]! + admitted;
    route.totalQi += admitted;
    if (residentNode !== undefined && residentNode >= 0) {
      this.nodeInFlight[residentNode] = this.nodeInFlight[residentNode]! + admitted;
    }
    return true;
  }

  tick(count = 1, productionBp = BP_SCALE): void {
    assertIntRange(count, 0, 1_000_000, 'QI_TICK_COUNT');
    assertIntRange(productionBp, 0, BP_SCALE, 'QI_PRODUCTION_BP');
    const production = mulDivFloor(this.productionPerTick, productionBp, BP_SCALE);
    let remaining = count;
    while (remaining > 0) {
      const room = this.unitQiHardCap - this.totalStoredQi();
      const produced = Math.max(0, Math.min(production, room));
      this.dantianQi += produced;
      let changed = produced > 0;
      for (let routeIndex = 0; routeIndex < this.routes.length; routeIndex += 1) {
        const route = this.routes[routeIndex]!;
        if (route.totalQi > 0 || this.routes[this.activeRouteIndex] === route) route.windowTicks += 1;
        if (this.moveRoute(route)) changed = true;
      }
      if (this.injectActiveRoute()) changed = true;
      for (let index = 0; index < this.backlog.length; index += 1) {
        if (this.backlog[index]! > 0) {
          this.backlog[index] = this.backlog[index]! - 1;
        }
      }
      this.tickNo += 1;
      this.version += 1;
      remaining -= 1;
      if (!changed && remaining > 0) {
        for (let routeIndex = 0; routeIndex < this.routes.length; routeIndex += 1) {
          const route = this.routes[routeIndex]!;
          if (route.totalQi > 0 || this.routes[this.activeRouteIndex] === route) {
            route.windowTicks += remaining;
          }
        }
        for (let index = 0; index < this.backlog.length; index += 1) {
          this.backlog[index] = Math.max(0, this.backlog[index]! - remaining);
        }
        this.tickNo += remaining;
        this.version += remaining;
        remaining = 0;
      }
    }
  }

  private releaseRouteQi(route: CompiledRoute, amount: number, blockedAt?: number): number {
    let remaining = amount;
    let released = 0;
    for (let slot = route.pipelineQi.length - 1; slot >= 0 && remaining > 0; slot -= 1) {
      if (blockedAt !== undefined && route.slotStepIndexes[slot]! <= blockedAt) continue;
      const removed = Math.min(remaining, route.pipelineQi[slot]!);
      if (removed <= 0) continue;
      route.pipelineQi[slot] = route.pipelineQi[slot]! - removed;
      route.totalQi -= removed;
      remaining -= removed;
      released += removed;
      const nodeIndex = route.slotNodeIndexes[slot];
      if (nodeIndex !== undefined && nodeIndex >= 0) {
        this.nodeInFlight[nodeIndex] = this.nodeInFlight[nodeIndex]! - removed;
      }
    }
    return released;
  }

  private validateMoveInput(input: CommitQiMoveInput, critical?: Pick<ResolveQiMoveInput,
    'critRollBp' | 'critChanceBp'>): void {
    if (input.moveId.length === 0 || input.causeId.length === 0) throw new RangeError('QI_MOVE_ID');
    assertIntRange(input.battleTick, 0, Number.MAX_SAFE_INTEGER, 'QI_BATTLE_TICK');
    if (critical !== undefined) {
      assertIntRange(critical.critRollBp, 0, 9999, 'QI_CRIT_ROLL');
      assertIntRange(critical.critChanceBp, 0, BP_SCALE, 'QI_CRIT_CHANCE');
    }
    for (const value of [input.reference.releasedQi, input.reference.meanFluxCap,
      input.reference.meanFlowBp, input.reference.routeQualityBp]) {
      assertIntRange(value, 1, Number.MAX_SAFE_INTEGER, 'QI_REFERENCE_ZERO');
    }
    if (input.defender !== undefined) {
      assertIntRange(input.defender.qiBp, 4000, 18000, 'QI_DEFENDER_PROFILE');
      assertIntRange(input.defender.widthBp, 4000, 18000, 'QI_DEFENDER_PROFILE');
      assertIntRange(input.defender.flowBp, 4000, 18000, 'QI_DEFENDER_PROFILE');
      assertIntRange(input.defender.completionBp, 0, 18000, 'QI_DEFENDER_PROFILE');
    }
  }

  commitMove(input: CommitQiMoveInput, battleRng: Rng): QiMoveResolution {
    this.validateAttackRoute(input.routeId);
    this.validateMoveInput(input);
    const route = this.routes.find((candidate) => candidate.id === input.routeId)!;
    const circulationBp = Math.min(BP_SCALE, mulDivFloor(route.windowTicks, BP_SCALE, route.travelTotal));
    const candidateQi = Math.min(
      route.totalQi, route.carryCap, route.releaseRate * route.windowTicks,
    );
    let incoming = Math.min(candidateQi, route.releaseRate);
    let attempted = 0;
    let completed = 0;
    let flowCt = 0;
    let qualityTotal = 0;
    let blockedAt: number | null = null;
    let blockedNode: string | null = null;
    let fluxTotal = 0;
    let effectiveFlowTotal = 0;
    const trace: QiFlowTraceStep[] = [];
    for (let stepIndex = 0; stepIndex < route.nodeIndexes.length; stepIndex += 1) {
      const nodeIndex = route.nodeIndexes[stepIndex]!;
      const acupointRef = this.nodeIds[nodeIndex]!;
      if (this.opened[nodeIndex] === 0 || this.ruptureDamage[nodeIndex]! > 0
        || this.sealLevel[nodeIndex]! >= 9) {
        blockedAt = stepIndex; blockedNode = acupointRef; break;
      }
      attempted += 1;
      flowCt += route.segmentCt[stepIndex]!;
      const effectiveFlow = effectiveNodeFlowBp(
        this.flowBp[nodeIndex]!, this.stagnationBp[nodeIndex]!, this.sealLevel[nodeIndex]!,
      );
      const throughput = mulDivFloor(this.fluxCap[nodeIndex]!, effectiveFlow, BP_SCALE);
      const normalPass = Math.min(incoming, throughput);
      const chance = jamChanceBp(incoming, this.fluxCap[nodeIndex]!, this.practiceBp,
        route.riskBp[stepIndex]!, this.stagnationBp[nodeIndex]!, this.sealLevel[nodeIndex]!);
      const jammed = chanceBp(battleRng, chance);
      const passed = jammed ? mulDivFloor(normalPass, 4000, BP_SCALE) : normalPass;
      const excess = incoming - passed;
      this.backlog[nodeIndex] = this.backlog[nodeIndex]! + excess;
      this.stagnationBp[nodeIndex] = clampInt(this.stagnationBp[nodeIndex]!
        + ceilDivInt(excess * 2500, Math.max(1, this.fluxCap[nodeIndex]!)) + (jammed ? 1000 : 0), 0, 9500);
      const ruptureThreshold = mulDivFloor(this.fluxCap[nodeIndex]! * this.lengthUnit[nodeIndex]!,
        12000 - floorDivInt(Math.min(this.stagnationBp[nodeIndex]!, 6000), 2), BP_SCALE);
      if (this.backlog[nodeIndex]! >= ruptureThreshold) {
        this.ruptureDamage[nodeIndex] = Math.max(this.ruptureDamage[nodeIndex]!,
          floorDivInt(this.fluxCap[nodeIndex]! * this.lengthUnit[nodeIndex]!, 2)
            + this.backlog[nodeIndex]! - ruptureThreshold);
      }
      trace.push({ acupointRef, incoming, passed, fluxCap: this.fluxCap[nodeIndex]!,
        effectiveFlowBp: effectiveFlow, jamChanceBp: chance, jammed });
      if (jammed || this.ruptureDamage[nodeIndex]! > 0) {
        blockedAt = stepIndex; blockedNode = acupointRef; break;
      }
      completed += 1;
      qualityTotal += mulDivFloor(
        Math.min(BP_SCALE, mulDivFloor(passed, BP_SCALE, Math.max(1, this.fluxCap[nodeIndex]!))),
        effectiveFlow, BP_SCALE,
      );
      fluxTotal += this.fluxCap[nodeIndex]!;
      effectiveFlowTotal += effectiveFlow;
      incoming = passed;
    }
    const routeLength = route.nodeIndexes.length;
    const routeQualityBp = floorDivInt(qualityTotal, routeLength);
    const meanFluxCap = completed > 0 ? floorDivInt(fluxTotal, completed) : 1;
    const meanFlowBp = completed > 0 ? floorDivInt(effectiveFlowTotal, completed) : 1;
    const releasedQi = this.releaseRouteQi(
      route, candidateQi, blockedAt === null ? undefined : blockedAt,
    );
    const profile = normalizeMeridianProfile({ releasedQi, meanFluxCap, meanFlowBp, routeQualityBp }, input.reference);
    const defender: MeridianProfile = input.defender ?? { qiBp: 10000, widthBp: 10000, flowBp: 10000, completionBp: 10000 };
    const attackerStrengthBp = meridianStrengthBp(profile);
    const baseMeridianAttackBp = attackMeridianBp(profile, defender, routeLength);
    const completionDamageBp = circulationDamageBp(circulationBp);
    const meridianAttackBp = finalMeridianAttackBp(baseMeridianAttackBp, circulationBp);
    route.windowTicks = 0;
    this.version += 1;
    return { t: 'qi.moveResolved', unitId: this.unitId, routeId: route.id,
        attempted, completed, flowCt, blockedAt,
        blockedNode, releasedQi, routeCarryCap: route.carryCap, routeTravelTicks: route.travelTotal,
        circulationBp, routeQualityBp, profile, attackerStrengthBp, baseMeridianAttackBp,
        circulationDamageBp: completionDamageBp, meridianAttackBp, trace };
  }

  createFullCycleCrit(
    input: ResolveQiMoveInput, releasedQi: number, routeCarryCap: number, circulationBp: number,
  ): FullCycleCritEvent | null {
    if (circulationBp !== BP_SCALE || releasedQi <= 0 || !input.critical || input.noCrit === true) return null;
    const index = messageIndex(input.causeId, input.moveId);
    return { t: 'qi.fullCycleCrit', unitId: this.unitId, targetIds: [...input.targetIds],
      moveId: input.moveId, routeId: input.routeId, releasedQi, routeCarryCap, circulationBp: 10000,
      critRollBp: input.critRollBp, critChanceBp: input.critChanceBp,
      messageKey: `qi.fullCycleCrit.${index + 1}`, message: FULL_CYCLE_MESSAGES[index]!,
      causeId: input.causeId, battleTick: input.battleTick };
  }

  resolveMove(input: ResolveQiMoveInput, battleRng: Rng): ResolveQiMoveResult {
    this.validateMoveInput(input, input);
    const resolution = this.commitMove(input, battleRng);
    return { resolution, fullCycleCrit: this.createFullCycleCrit(input, resolution.releasedQi,
      resolution.routeCarryCap, resolution.circulationBp) };
  }

  snapshot(transient?: MeridianFlowTransientState): MeridianFlowSnapshot {
    const foreignQi = transient?.foreignQi ?? this.foreignQi;
    const acupointOccupancies = transient?.acupointOccupancies ?? this.acupointOccupancies;
    const redirectedQi = transient?.redirectedQi ?? this.redirectedQi;
    const redirectedQiExpiresAtOwnAction = transient === undefined
      ? this.redirectedQiExpiresAtOwnAction : transient.redirectedQiExpiresAtOwnAction;
    return { schema: 'meridian-flow-state.v2', rulesProtocol: 3, unitId: this.unitId,
      unitIndex: this.unitIndex, kind: this.unitKind, tick: this.tickNo,
      dantianQi: this.dantianQi,
      activeRouteId: this.activeRouteIndex < 0 ? null : this.routes[this.activeRouteIndex]!.id,
      stateVersion: this.version, routes: this.routes.map((route) => ({ routeId: route.id,
        windowTicks: route.windowTicks, totalQi: route.totalQi, pipelineQi: [...route.pipelineQi] })),
      nodes: this.nodeIds.map((acupointRef, index) => ({ acupointRef,
        opened: this.opened[index] === 1, fluxCap: this.fluxCap[index]!,
        lengthUnit: this.lengthUnit[index]!, flowBp: this.flowBp[index]!,
        inFlightQi: this.nodeInFlight[index]!, stagnationBp: this.stagnationBp[index]!,
        backlog: this.backlog[index]!, ruptureDamage: this.ruptureDamage[index]!,
        sealLevel: this.sealLevel[index]! })), grappleLevel: this.grappleLevel,
      grappleSource: this.grappleSource, grappleRemaining: this.grappleRemaining,
      foreignQi: foreignQi.map((entry) => ({ ...entry, reversePath: entry.reversePath.map((step) =>
        ({ ...step })) })).sort((left, right) => left.arrivedAtTick - right.arrivedAtTick || left.id - right.id),
      acupointOccupancies: acupointOccupancies.map((entry) => ({ ...entry,
        affectedRouteRefs: [...entry.affectedRouteRefs].sort(compareCodePoints) }))
        .sort((left, right) => compareCodePoints(left.acupointRef, right.acupointRef)
          || compareCodePoints(left.sourceUnitId, right.sourceUnitId)),
      redirectedQi, redirectedQiExpiresAtOwnAction };
  }

  restore(snapshot: MeridianFlowSnapshot): void {
    if (snapshot.schema !== 'meridian-flow-state.v2' || snapshot.rulesProtocol !== 3
      || snapshot.unitId !== this.unitId
      || snapshot.routes.length !== this.routes.length || snapshot.nodes.length !== this.nodeIds.length) {
      throw new RangeError('QI_SNAPSHOT_SHAPE');
    }
    const activeRouteIndex = snapshot.activeRouteId === null
      ? -1 : this.routes.findIndex((route) => route.id === snapshot.activeRouteId);
    if (snapshot.activeRouteId !== null && activeRouteIndex < 0) throw new RangeError('QI_SNAPSHOT_ROUTE');
    assertIntRange(snapshot.tick, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
    assertIntRange(snapshot.stateVersion, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
    assertIntRange(snapshot.dantianQi, 0, this.unitQiHardCap, 'QI_SNAPSHOT_VALUE');
    assertIntRange(snapshot.unitIndex, 0, 1_000_000, 'QI_SNAPSHOT_VALUE');
    assertIntRange(snapshot.grappleLevel, 0, 9, 'QI_SNAPSHOT_VALUE');
    assertIntRange(snapshot.grappleRemaining, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
    assertIntRange(snapshot.redirectedQi, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
    if (snapshot.redirectedQiExpiresAtOwnAction !== null) {
      assertIntRange(snapshot.redirectedQiExpiresAtOwnAction, 0, Number.MAX_SAFE_INTEGER,
        'QI_SNAPSHOT_VALUE');
    }
    let previousForeign: ForeignQiInstance | undefined;
    for (const foreign of snapshot.foreignQi) {
      assertIntRange(foreign.id, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      assertIntRange(foreign.injectedQi, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      assertIntRange(foreign.remainingQi, 0, foreign.injectedQi, 'QI_SNAPSHOT_VALUE');
      assertIntRange(foreign.stepIndex, 0, foreign.reversePath.length, 'QI_SNAPSHOT_VALUE');
      assertIntRange(foreign.remainingTravelTick, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      assertIntRange(foreign.arrivedAtTick, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      if (previousForeign !== undefined && (foreign.arrivedAtTick < previousForeign.arrivedAtTick
        || (foreign.arrivedAtTick === previousForeign.arrivedAtTick && foreign.id <= previousForeign.id))) {
        throw new RangeError('QI_SNAPSHOT_ORDER');
      }
      previousForeign = foreign;
    }
    let previousOccupancy: AcupointOccupancy | undefined;
    for (const occupancy of snapshot.acupointOccupancies) {
      assertIntRange(occupancy.occupyingQi, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      assertIntRange(occupancy.level, 1, 9, 'QI_SNAPSHOT_VALUE');
      assertIntRange(occupancy.remainingOwnActions, 1, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      if (previousOccupancy !== undefined && (compareCodePoints(previousOccupancy.acupointRef,
        occupancy.acupointRef) > 0 || (previousOccupancy.acupointRef === occupancy.acupointRef
          && compareCodePoints(previousOccupancy.sourceUnitId, occupancy.sourceUnitId) >= 0))) {
        throw new RangeError('QI_SNAPSHOT_ORDER');
      }
      previousOccupancy = occupancy;
    }
    const restoredInFlight = new Int32Array(this.nodeIds.length);
    let storedQi = snapshot.dantianQi;
    for (let index = 0; index < this.routes.length; index += 1) {
      const target = this.routes[index]!;
      const source = snapshot.routes[index]!;
      if (target.id !== source.routeId || target.pipelineQi.length !== source.pipelineQi.length) {
        throw new RangeError('QI_SNAPSHOT_ROUTE');
      }
      assertIntRange(source.windowTicks, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      assertIntRange(source.totalQi, 0, target.carryCap, 'QI_SNAPSHOT_VALUE');
      let routeTotal = 0;
      for (let slot = 0; slot < target.slotNodeIndexes.length; slot += 1) {
        const amount = source.pipelineQi[slot]!;
        assertIntRange(amount, 0, target.carryCap, 'QI_SNAPSHOT_VALUE');
        routeTotal += amount;
        const nodeIndex = target.slotNodeIndexes[slot]!;
        if (nodeIndex >= 0) restoredInFlight[nodeIndex] = restoredInFlight[nodeIndex]! + amount;
      }
      const outlet = source.pipelineQi[target.pipelineQi.length - 1]!;
      assertIntRange(outlet, 0, target.carryCap, 'QI_SNAPSHOT_VALUE');
      routeTotal += outlet; storedQi += routeTotal;
      if (routeTotal !== source.totalQi) throw new RangeError('QI_SNAPSHOT_ROUTE');
    }
    if (storedQi > this.unitQiHardCap) throw new RangeError('QI_SNAPSHOT_VALUE');
    for (let index = 0; index < snapshot.nodes.length; index += 1) {
      const source = snapshot.nodes[index]!;
      if (source.acupointRef !== this.nodeIds[index] || source.inFlightQi !== restoredInFlight[index]) {
        throw new RangeError('QI_SNAPSHOT_NODE');
      }
      if (source.opened !== (this.opened[index] === 1) || source.fluxCap !== this.fluxCap[index]
        || source.lengthUnit !== this.lengthUnit[index] || source.flowBp !== this.flowBp[index]) {
        throw new RangeError('QI_SNAPSHOT_NODE');
      }
      assertIntRange(source.stagnationBp, 0, 9500, 'QI_SNAPSHOT_VALUE');
      assertIntRange(source.backlog, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      assertIntRange(source.ruptureDamage, 0, Number.MAX_SAFE_INTEGER, 'QI_SNAPSHOT_VALUE');
      assertIntRange(source.sealLevel, 0, 9, 'QI_SNAPSHOT_VALUE');
      if (source.inFlightQi > this.fluxCap[index]! * this.lengthUnit[index]!) {
        throw new RangeError('QI_SNAPSHOT_NODE');
      }
    }
    this.tickNo = snapshot.tick; this.dantianQi = snapshot.dantianQi;
    this.unitIndex = snapshot.unitIndex; this.unitKind = snapshot.kind;
    this.grappleLevel = snapshot.grappleLevel; this.grappleSource = snapshot.grappleSource;
    this.grappleRemaining = snapshot.grappleRemaining;
    this.version = snapshot.stateVersion; this.activeRouteIndex = activeRouteIndex;
    this.foreignQi = snapshot.foreignQi.map((entry) => ({ ...entry,
      reversePath: entry.reversePath.map((step) => ({ ...step })) }));
    this.acupointOccupancies = snapshot.acupointOccupancies.map((entry) => ({ ...entry,
      affectedRouteRefs: [...entry.affectedRouteRefs] }));
    this.redirectedQi = snapshot.redirectedQi;
    this.redirectedQiExpiresAtOwnAction = snapshot.redirectedQiExpiresAtOwnAction;
    this.nodeInFlight.set(restoredInFlight);
    for (let index = 0; index < this.routes.length; index += 1) {
      const target = this.routes[index]!; const source = snapshot.routes[index]!;
      target.windowTicks = source.windowTicks; target.totalQi = source.totalQi;
      target.pipelineQi.set(source.pipelineQi);
    }
    for (let index = 0; index < snapshot.nodes.length; index += 1) {
      const source = snapshot.nodes[index]!;
      this.stagnationBp[index] = source.stagnationBp;
      this.backlog[index] = source.backlog;
      this.ruptureDamage[index] = source.ruptureDamage;
      this.sealLevel[index] = source.sealLevel;
    }
  }
}

export function createMeridianFlowRuntime(input: MeridianFlowInput): MeridianFlowRuntime {
  return new MeridianFlowRuntime(input);
}
