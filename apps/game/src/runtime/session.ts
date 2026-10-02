import { advanceGameClock, equipItem, unequipItem, type DomainEvent } from '@tianshu/core';
import type { JsonValue } from '@tianshu/shared';
import type { GameCommand } from './contracts';
import type { BattleUiCommand } from '../battle/contracts';
import type { BattleRuntime } from '../battle/runtime';
import { createSelectors } from '../projection';
import { createPreviewSession } from './bootstrap';
import { equipmentRules, type GameContent } from './content';
import { ALL_VIEWS, type DirtyView, type GameRemote, type GameUpdate, type SessionSnapshot } from './contracts';
import { applyItemUse } from './item-adapter';
import { validateSession } from './validate';

/** Worker composition of core functions. This adapter defines no stat or combat formulas. */
export function createGameSession(content: GameContent, initial = createPreviewSession(content)): GameRemote {
  let session = validateSession(initial, content);
  const selectors = createSelectors(content);
  const rules = equipmentRules(content);
  let battle: BattleRuntime | null = null;
  async function battleCommand(command: BattleUiCommand): Promise<GameUpdate> {
    if (command.t === 'battle/enter' || command.t === 'battle/demo') {
      if (battle) throw new Error('BATTLE_ALREADY_ACTIVE');
      if (command.t === 'battle/demo' && !session.preview) throw new Error('BATTLE_DEMO_FORBIDDEN');
      const { BattleRuntime } = await import('../battle/runtime');
      const launch = command.t === 'battle/demo'
        ? (await import('../battle/demo')).createBattleDemo(command.source) : command.launch;
      const candidate = new BattleRuntime(launch);
      const packet = candidate.packet(true); battle = candidate;
      const setup = candidate.launch.setup;
      return { accepted: true, changes: { battle: packet }, events: [{ t: 'battle/setupResolved', payload: {
        setupId: setup.setupId, encounterId: setup.encounterId, participants: setup.participants.map(row => row.unitRef),
        winCond: setup.end.winCond, loseCond: setup.end.loseCond, drawCond: setup.end.drawCond,
      } as JsonValue }] };
    }
    if (!battle) throw new Error('BATTLE_NOT_ACTIVE');
    if (command.t === 'battle/leave') {
      const packet = battle.packet();
      if (!packet.result) throw new Error('BATTLE_NOT_ENDED');
      const context = battle.launch.setup.returnContext; battle = null;
      return { accepted: true, changes: { battle: null }, events: [{ t: 'battle/returned', payload: { ...context } }] };
    }
    const result = battle.execute(command);
    return { accepted: true, changes: { battle: result.packet },
      events: result.events.map(event => ({ t: event.t, payload: { ...event } as JsonValue })) };
  }
  function validated(candidate: SessionSnapshot): SessionSnapshot {
    const next = validateSession(candidate, content);
    if (next.preview !== initial.preview) throw new Error('SAVE_MODE_INVALID');
    return next;
  }
  selectors.update(session, ALL_VIEWS);
  return {
    query: () => ({ ...selectors.query(), battle: battle?.packet(true) ?? null }),
    snapshot: () => { if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE'); return structuredClone(session); },
    validate: (candidate) => { validated(candidate); },
    restore(candidate): GameUpdate {
      if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE');
      const next = validated(candidate);
      const changes = selectors.update(next, ALL_VIEWS, '已读取存档');
      session = next;
      return { accepted: true, changes, events: [] };
    },
    async dispatch(command: GameCommand): Promise<GameUpdate> {
      try {
        if (command.t.startsWith('battle/')) return await battleCommand(command as BattleUiCommand);
        if (battle) throw new Error('BATTLE_BUSY');
        let next: SessionSnapshot = session;
        let dirty: readonly DirtyView[] = [];
        let facts: readonly { readonly t: string }[] = [];
        if (command.t === 'world/tick') {
          const result = advanceGameClock(session.state.chapter.clock, 1);
          next = { ...session, state: { ...session.state,
            meta: { ...session.state.meta, worldTick: result.clock.elapsedTicks },
            chapter: { ...session.state.chapter, clock: result.clock, worldYear: result.clock.epochYear + result.clock.yearOffset } } };
          facts = [{ t: 'world/ticked' }, ...result.events]; dirty = ['hud'];
        } else if (command.t === 'inventory/equip' || command.t === 'inventory/unequip') {
          if (command.t === 'inventory/equip' && rules.find((rule) => rule.itemId === command.itemId)?.slot !== command.slot)
            throw new Error('EQUIPMENT_SLOT_MISMATCH');
          const result = command.t === 'inventory/equip'
            ? equipItem(session.state.party.equipment, session.state.party.inventory, content.items, rules, command.itemId)
            : unequipItem(session.state.party.equipment, session.state.party.inventory, content.items, rules, command.slot);
          next = { ...session, state: { ...session.state, party: { ...session.state.party,
            equipment: result.equipment, inventory: result.inventory } } };
          dirty = ['inventory', 'equipment']; facts = result.events;
        } else if (command.t === 'inventory/use') {
          const result = applyItemUse(session, content, command.itemId, command.targetId);
          next = result.next; dirty = ['hud', 'characters', 'inventory']; facts = result.events;
        } else throw new Error('COMMAND_UNKNOWN');
        const stateVersion = session.state.meta.stateVersion + 1;
        const firstSeq = session.state.meta.nextEventSeq;
        next = { ...next, state: { ...next.state, meta: { ...next.state.meta,
          stateVersion, nextEventSeq: firstSeq + facts.length } } };
        const events: DomainEvent[] = facts.map((fact, index) => fact.t === 'world/ticked'
          ? { t: 'world/ticked', seq: firstSeq + index, stateVersion, worldTick: next.state.meta.worldTick }
          : { t: fact.t, payload: { ...fact, seq: firstSeq + index, stateVersion, worldTick: next.state.meta.worldTick } });
        // Prepare everything before the single commit point; a rejection cannot consume an item.
        const changes = selectors.update(next, dirty);
        session = next;
        return { accepted: true, changes, events };
      } catch (error) {
        return { accepted: false, changes: {}, events: [], error: error instanceof Error ? error.message : 'COMMAND_FAILED' };
      }
    },
  };
}
