import type { MeridianFlowRuntime } from './runtime';
import type { QiGatherStatus } from './types';

/**
 * 急性聚气门面不再维护旧版 GatherState。状态归属如下：
 *
 * - 真气库存、路线载量与周天进度：MeridianFlowRuntime；
 * - 行动 CT 与收招 1000：battle/action + battle/timeline；
 * - RNG：本动作不接收 RNG，也不产生任何随机消费；
 * - 快照：调用方只持久化 runtime 的 meridian-flow-state.v2。
 *
 * 保留独立门面是为了让非战斗宿主和命令测试共用同一条校验路径，
 * 而不是恢复已废弃的第二份聚气状态。
 */

/**
 * Acute gathering is a route-selection action over the canonical flow runtime.
 * It deliberately owns no CT or secondary gather ledger: battle timeline recovery
 * is settled by the battle action transaction.
 */
export interface AcuteGatheredEvent {
  readonly t: 'qi.acuteGathered';
  readonly unitId: string;
  readonly routeId: string;
  readonly status: QiGatherStatus;
}

/**
 * Read-only availability projection for AI and UI callers. The runtime validates
 * that the route exists, is open and has attack purpose.
 */
export function queryAcuteGather(flow: MeridianFlowRuntime, routeId: string): QiGatherStatus {
  return flow.queryGatherStatus(routeId);
}

/**
 * Select an attack route for subsequent qi ticks. A route at carry capacity may
 * still be selected while its packets have not completed a full circulation.
 * This operation never accepts or consumes RNG.
 */
export function acuteGather(flow: MeridianFlowRuntime, routeId: string): AcuteGatheredEvent {
  const status = queryAcuteGather(flow, routeId);
  if (status.full) throw new RangeError('QI_CARRY_FULL');
  flow.selectRoute(routeId);
  return { t: 'qi.acuteGathered', unitId: flow.unitId, routeId, status };
}
