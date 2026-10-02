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
      capabilities: { move: disabled, item: disabled, defend: disabled, gather: enabled } } });
    const buttons = wrapper.findAll('button');
    await buttons.find(button => button.text() === '待机')!.trigger('click');
    await wrapper.get('[data-gather]').trigger('click');
    expect(wrapper.emitted('command')).toEqual([
      [{ t: 'battle/wait', actor: actor.id, revision: 0 }],
      [{ t: 'battle/gather', actor: actor.id, revision: 0, routeId: '' }],
    ]);
    expect(buttons.find(button => button.text() === '移动')!.attributes('disabled')).toBeDefined();
  });
});
