import { TICKS_PER_SHICHEN, advanceGameClock, useConsumable } from '@tianshu/core';
import type { ItemDef } from '@tianshu/data/schemas';
import type { SessionSnapshot } from './contracts';
import type { GameContent } from './content';

const wiredEffects = new Set(['healPct', 'mpPct', 'dispel']);
export function useUnavailableReason(item: ItemDef): string {
  if (!item.use) return '此物不能直接服用';
  if (item.use.context === 'battle') return '仅能在战斗中使用';
  if (item.use.target !== 'self' && item.use.target !== 'ally') return '请在对应目标场景使用';
  if (item.kind === 'ammo' || item.use.effects.some((effect) => !wiredEffects.has(effect.op)) ||
      item.use.meridianTemper || item.use.meridianAid) return '此物的完整效果尚未开放';
  return '';
}
export function applyItemUse(session: SessionSnapshot, content: GameContent, itemId: string, targetId: string) {
  const item = content.items.find((row) => row.id === itemId);
  if (!item || useUnavailableReason(item)) throw new Error('ITEM_EFFECT_UNAVAILABLE');
  const character = session.state.profile.protagonist;
  if (!character || character.characterId !== targetId || character.status !== 'active' || character.resources.hp <= 0)
    throw new Error('ITEM_TARGET_UNAVAILABLE');
  const stored = session.itemTargets[targetId];
  const target = { ...(stored ?? { stamina: 0, staminaMax: 0, ailments: [], temporaryEffects: [],
    permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 }, meridianAids: [] }),
    characterId: targetId, alive: true, hp: character.resources.hp, hpMax: character.stats.hpMax,
    mp: character.resources.mp, mpMax: character.stats.mpMax, meridians: character.meridians };
  const result = useConsumable({ inventory: session.state.party.inventory, itemDefs: content.items,
    item, target, context: 'field', currentTick: session.state.meta.worldTick,
    usage: { ...session.usage, battleUses: {} } });
  // ENG-06 currently counts perBattle even in field; retain only the field ledger here.
  const usage = { ...result.usage, battleUses: session.usage.battleUses,
    ...(session.usage.lastBattleUseTurns ? { lastBattleUseTurns: session.usage.lastBattleUseTurns } : {}) };
  const time = advanceGameClock(session.state.chapter.clock, result.fieldTime * TICKS_PER_SHICHEN);
  const next: SessionSnapshot = { ...session, usage, itemTargets: { ...session.itemTargets, [targetId]: result.target },
    state: { ...session.state, meta: { ...session.state.meta, worldTick: time.clock.elapsedTicks },
      chapter: { ...session.state.chapter, clock: time.clock, worldYear: time.clock.epochYear + time.clock.yearOffset },
      party: { ...session.state.party, inventory: result.inventory },
      profile: { ...session.state.profile, protagonist: { ...character,
        resources: { hp: result.target.hp, mp: result.target.mp }, meridians: result.target.meridians } } } };
  return { next, events: [...result.events, ...time.events] };
}
