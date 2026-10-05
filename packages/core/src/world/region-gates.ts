import type { GateEvaluation, RegionGateExpr, RegionGateFacts, RegionGateReason } from './region-types';
import { qinggongTier } from '../hex';

const denied = (reason: RegionGateReason): GateEvaluation => ({ allowed: false, reason });
const allowed: GateEvaluation = { allowed: true, reason: null };
const includes = (values: readonly string[] | undefined, value: string): boolean =>
  values?.includes(value) === true;

function atomReason(expr: RegionGateExpr): RegionGateReason {
  if ('qg' in expr) return 'REGION_GATE_QINGGONG';
  if ('item' in expr) return 'REGION_GATE_ITEM';
  if ('quest' in expr) return 'REGION_GATE_QUEST';
  if ('flag' in expr || 'status' in expr || 'buff' in expr) return 'REGION_GATE_FLAG';
  return 'REGION_GATE_CAPABILITY';
}

function atom(expr: RegionGateExpr, facts: RegionGateFacts): boolean {
  if ('qg' in expr) return qinggongTier(facts.qinggong) >= expr.qg;
  if ('item' in expr) return (facts.items?.[expr.item] ?? 0) > 0;
  if ('flag' in expr) return includes(facts.flags, expr.flag);
  if ('fame' in expr) return (facts.fame ?? 0) >= expr.fame;
  if ('morality' in expr) return (facts.morality ?? 0) >= expr.morality[0] &&
    (facts.morality ?? 0) <= expr.morality[1];
  if ('sect' in expr) return facts.sect === expr.sect &&
    (expr.rank === undefined || (facts.sectRank ?? 0) >= expr.rank);
  if ('status' in expr) return includes(facts.statuses, expr.status);
  if ('quest' in expr) return facts.quests?.[expr.quest] === expr.state;
  if ('act' in expr) return (facts.act ?? 0) >= expr.act;
  if ('formation' in expr) return (facts.formation ?? 0) >= expr.formation;
  if ('check' in expr) return (facts.skills?.[expr.check.skill] ?? 0) >= expr.check.dc;
  if ('swim' in expr) return (facts.swim ?? 0) >= expr.swim;
  if ('beast' in expr) return (facts.beast ?? 0) >= expr.beast;
  if ('mount' in expr) return includes(facts.mounts, expr.mount);
  if ('boat' in expr) return includes(facts.boats, expr.boat);
  if ('light' in expr) return facts.light === true;
  if ('special' in expr) return includes(facts.specials, expr.special);
  if ('device' in expr) return includes(facts.devices, expr.device);
  if ('str' in expr) return (facts.strength ?? 0) >= expr.str;
  if ('companion' in expr) return facts.companionQinggongTiers?.some(
    (tier) => tier >= expr.companion.qgMin) === true;
  if ('buff' in expr) return includes(facts.buffs, expr.buff);
  if ('shichen' in expr || 'day' in expr || 'festival' in expr ||
      'weather' in expr || 'season' in expr) {
    return (expr.shichen === undefined || facts.shichen === expr.shichen) &&
      (expr.day === undefined || facts.day === expr.day) &&
      (expr.festival === undefined || facts.festival === expr.festival) &&
      (expr.weather === undefined || facts.weather === expr.weather) &&
      (expr.season === undefined || facts.season === expr.season);
  }
  return false;
}

export function evaluateGate(expr: RegionGateExpr, facts: RegionGateFacts): GateEvaluation {
  if ('all' in expr) {
    for (const child of expr.all) { const result = evaluateGate(child, facts); if (!result.allowed) return result; }
    return allowed;
  }
  if ('any' in expr) {
    const results = expr.any.map((child) => evaluateGate(child, facts));
    return results.some((result) => result.allowed) ? allowed : results[0] ?? denied('REGION_GATE_LOCKED');
  }
  if ('not' in expr) return evaluateGate(expr.not, facts).allowed ? denied(atomReason(expr.not)) : allowed;
  return atom(expr, facts) ? allowed : denied(atomReason(expr));
}
