// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { BattleRuntime } from '../runtime';
import { createBattleDemo } from '../demo';
import BattleActions from './BattleActions.vue';

const enabled = { enabled: true, reason: '' };
const disabled = { enabled: false, reason: '尚未接通' };
describe('battle action menu', () => {
  it('emits stable wait and acute-gather command DTOs', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const actor = packet.units.find(unit => unit.id === packet.actorId)!;
    const wrapper = mount(BattleActions, { props: { actor, revision: packet.revision,
      busy: false, automatic: false, preview: null, selectedMove: null,
      concedeAllowed: false, demonstrationReplayId: null, subdueActorId: null, subdueTargets: [],
      capabilities: { move: { ...disabled, reachable: [], selected: null }, item: disabled,
        defend: disabled, gather: enabled, wait: enabled, items: [], routes: [{
          routeId: 'mfr_fixture_basic', purpose: 'attack', capability: enabled, dantianQi: 0,
          inFlight: 0, capacity: 16, completionBp: 0, routeQualityBp: 0, blockedAt: null,
        }], itemUses: 0, itemMaxUses: 3 } } });
    const buttons = wrapper.findAll('button');
    await buttons.find(button => button.text() === '待机')!.trigger('click');
    await wrapper.get('[data-gather]').trigger('click');
    await wrapper.get('select').setValue('mfr_fixture_basic');
    await wrapper.get('[data-confirm-gather]').trigger('click');
    expect(wrapper.emitted('command')).toEqual([[{ t: 'battle/wait', actor: actor.id, revision: 0 }],
      [{ t: 'battle/movement-mode', enabled: false }],
      [{ t: 'battle/gather', actor: actor.id, revision: 0, routeId: 'mfr_fixture_basic' }]]);
    expect(wrapper.get('[data-movement]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-item]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-defend]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-wait]').attributes('disabled')).toBeUndefined();
    expect(wrapper.get('[data-gather]').attributes('disabled')).toBeUndefined();
    expect(wrapper.get('.capability-reasons').text()).toContain('移动：尚未接通');
    expect(wrapper.get('.capability-reasons').text()).toContain('物品：本场物品次数 0/3 · 尚未接通');
    expect(wrapper.get('.capability-reasons').text()).toContain('防御：尚未接通');
    expect(wrapper.emitted('movement')).toBeUndefined();
  });
  it('emits core-approved guard and item plans with the selected walk destination', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const actor = packet.units.find(unit => unit.id === packet.actorId)!;
    const destination = packet.capabilities.move.reachable.find(cell => cell.cost > 0)!;
    const itemCapability = { enabled: true, reason: '' };
    const items = [{ id: 'it_jinchuangyao', name: '金创药', count: 2, capability: itemCapability,
      targets: [{ id: actor.id, name: actor.name, capability: itemCapability }] }];
    const wrapper = mount(BattleActions, { props: { actor, revision: 3, busy: false, automatic: false,
      preview: null, selectedMove: null, concedeAllowed: false, demonstrationReplayId: null,
      subdueActorId: null, subdueTargets: [], capabilities: { ...packet.capabilities,
        move: { ...packet.capabilities.move, selected: destination }, item: itemCapability, items } } });
    await wrapper.get('[data-defend]').trigger('click');
    expect(wrapper.emitted('command')).toEqual([[{ t: 'battle/movement-mode', enabled: false }]]);
    await wrapper.get('[data-confirm-move]').trigger('click');
    await wrapper.get('[data-item]').trigger('click');
    await wrapper.get('select').setValue('it_jinchuangyao'); await wrapper.vm.$nextTick();
    await wrapper.findAll('select')[1]!.setValue(actor.id);
    await wrapper.get('[data-confirm-item]').trigger('click');
    expect(wrapper.emitted('command')).toEqual([[{ t: 'battle/movement-mode', enabled: false }],
    [{ t: 'battle/defend', actor: actor.id, revision: 3,
      walkTo: { q: destination.q, r: destination.r } }],
    [{ t: 'battle/movement-mode', enabled: false }], [{ t: 'battle/item', actor: actor.id,
      itemId: 'it_jinchuangyao', targetId: actor.id, revision: 3,
      walkTo: { q: destination.q, r: destination.r } }]]);
    expect(wrapper.get('[data-gather]').attributes('disabled')).toBeUndefined();
    await wrapper.get('[data-movement]').trigger('click');
    expect(wrapper.emitted('command')?.at(-1)).toEqual([{ t: 'battle/movement-mode', enabled: true }]);
  });
  it('keeps move plus wait as a draft until the shared confirmation', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const actor = packet.units.find(unit => unit.id === packet.actorId)!;
    const destination = packet.capabilities.move.reachable.find(cell => cell.cost > 0)!;
    const wrapper = mount(BattleActions, { props: { actor, revision: 4, busy: false, automatic: false,
      preview: null, selectedMove: null, concedeAllowed: false, demonstrationReplayId: null,
      subdueActorId: null, subdueTargets: [], capabilities: { ...packet.capabilities,
        move: { ...packet.capabilities.move, selected: destination } } } });
    await wrapper.get('[data-wait]').trigger('click');
    expect(wrapper.emitted('command')).toEqual([[{ t: 'battle/movement-mode', enabled: false }]]);
    expect(wrapper.get('[data-confirm-move]').attributes('disabled')).toBeUndefined();
    await wrapper.get('[data-confirm-move]').trigger('click');
    expect(wrapper.emitted('command')?.at(-1)).toEqual([{ t: 'battle/wait', actor: actor.id, revision: 4,
      walkTo: { q: destination.q, r: destination.r } }]);
  });
  it('offers cancellation for an attack-only preview', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const actor = packet.units.find(unit => unit.id === packet.actorId)!;
    const preview = { requestId: 1, revision: 0, actor: actor.id, moveId: actor.moves[0]!.id,
      anchor: { q: 1, r: 0 }, aim: { dirCount: 6 as const, dir: 0 as const }, cells: [],
      targetIds: [], targetGeometry: [], valid: true, reason: '' };
    const wrapper = mount(BattleActions, { props: { actor, revision: 0, busy: false, automatic: false,
      preview, selectedMove: actor.moves[0]!.id, concedeAllowed: false, demonstrationReplayId: null,
      subdueActorId: null, subdueTargets: [], capabilities: packet.capabilities } });
    await wrapper.get('[data-cancel-plan]').trigger('click');
    expect(wrapper.emitted('command')?.at(-1)).toEqual([{ t: 'battle/cancel-plan', revision: 0 }]);
  });

  it('emits a stable mercy-subdue command for each eligible target', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const actor = packet.units.find(unit => unit.id === packet.actorId)!;
    const target = packet.units.find(unit => unit.side === 'enemy')!;
    const wrapper = mount(BattleActions, { props: { actor, revision: 7, busy: false,
      automatic: false, preview: null, selectedMove: null, concedeAllowed: false,
      demonstrationReplayId: null, subdueActorId: actor.id, subdueTargets: [target],
      capabilities: { ...packet.capabilities, item: disabled, defend: enabled, gather: enabled } } });
    await wrapper.get('[data-subdue]').trigger('click');
    expect(wrapper.emitted('command')).toEqual([[{ t: 'battle/subdue', actor: actor.id,
      target: target.id, revision: 7 }]]);
  });
});
