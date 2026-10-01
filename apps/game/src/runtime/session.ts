import { advanceGameClock, equipItem, unequipItem, type DomainEvent } from '@tianshu/core';
import type { UiCommand } from '@tianshu/ui';
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
  function validated(candidate: SessionSnapshot): SessionSnapshot {
    const next = validateSession(candidate, content);
    if (next.preview !== initial.preview) throw new Error('SAVE_MODE_INVALID');
    return next;
  }
  selectors.update(session, ALL_VIEWS);
  return {
    query: () => selectors.query(),
    snapshot: () => structuredClone(session),
    validate: (candidate) => { validated(candidate); },
    restore(candidate): GameUpdate {
      const next = validated(candidate);
      const changes = selectors.update(next, ALL_VIEWS, '已读取存档');
      session = next;
      return { accepted: true, changes, events: [] };
    },
    dispatch(command: UiCommand): GameUpdate {
      try {
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
